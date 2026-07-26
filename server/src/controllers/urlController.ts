import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../utils/prisma';
import { cppInvoker } from '../utils/cppInvoker';
import { z } from 'zod';

const createUrlSchema = z.object({
    originalUrl: z.string().url(),
    customAlias: z.string().optional(),
    expiresAt: z.string().optional(),
    password: z.string().optional(),
});

export const createUrl = async (req: any, res: Response): Promise<void> => {
    try {
        const { originalUrl, customAlias, expiresAt, password } = createUrlSchema.parse(req.body);
        const userId = req.user.id;

        let shortCode = customAlias;

        if (customAlias) {
            const existing = await prisma.url.findFirst({ where: { OR: [{ shortCode: customAlias }, { customAlias }] } });
            if (existing) {
                res.status(400).json({ error: 'Custom alias already in use' });
                return;
            }
        } else {
            // Use C++ DSA Module to generate code
            shortCode = await cppInvoker.generateUnique(originalUrl);
        }

        const url = await prisma.url.create({
            data: {
                originalUrl,
                shortCode: shortCode!,
                customAlias,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                password,
                userId
            }
        });

        res.status(201).json(url);
    } catch (error: any) {
        res.status(400).json({ error: error.errors || error.message });
    }
};

export const getUrls = async (req: any, res: Response): Promise<void> => {
    try {
        const urls = await prisma.url.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(urls);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateUrl = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isDisabled } = req.body;
        
        const url = await prisma.url.findUnique({ where: { id } });
        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        const updated = await prisma.url.update({
            where: { id },
            data: { isDisabled }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteUrl = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const url = await prisma.url.findUnique({ where: { id } });
        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        await prisma.clickLog.deleteMany({ where: { urlId: id } });
        await prisma.url.delete({ where: { id } });
        
        res.json({ message: 'URL deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const generateQR = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const url = await prisma.url.findUnique({ where: { id } });
        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const fullUrl = `${baseUrl}/${url.shortCode}`; // In production, use env var
        const qrCodeDataUrl = await QRCode.toDataURL(fullUrl);
        
        res.json({ qrCode: qrCodeDataUrl });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
