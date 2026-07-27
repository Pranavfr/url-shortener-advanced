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

export const bulkCreateUrl = async (req: any, res: Response): Promise<void> => {
    try {
        const { urls } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(urls)) {
            res.status(400).json({ error: 'urls must be an array' });
            return;
        }

        const createdUrls = [];

        for (const item of urls) {
            const { originalUrl, customAlias, expiresAt, password } = item;
            
            let shortCode = customAlias;

            if (customAlias) {
                const existing = await prisma.url.findFirst({ where: { OR: [{ shortCode: customAlias }, { customAlias }] } });
                if (existing) {
                    continue; // Skip this one
                }
            } else {
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
            createdUrls.push(url);
        }

        res.status(201).json({ created: createdUrls.length, urls: createdUrls });
    } catch (error: any) {
        res.status(500).json({ error: 'Server error during bulk create' });
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

export const unlockUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortCode } = req.params;
        const { password } = req.body;
        
        const url = await prisma.url.findUnique({ where: { shortCode } });
        
        if (!url) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        if (url.isDisabled) {
            res.status(403).json({ error: 'URL is disabled' });
            return;
        }

        if (url.expiresAt && new Date() > url.expiresAt) {
            res.status(410).json({ error: 'URL has expired' });
            return;
        }

        if (url.password !== password) {
            res.status(401).json({ error: 'Incorrect password' });
            return;
        }

        // Increment clicks
        await prisma.url.update({
            where: { id: url.id },
            data: { clicks: { increment: 1 } }
        });

        // Save Analytics
        const userAgent = req.headers['user-agent'] || '';
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';

        let device = 'Desktop';
        if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';

        const geoip = require('geoip-lite');
        const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';
        const ipToResolve = clientIp.split(',')[0].trim();
        const geo = geoip.lookup(ipToResolve);

        await prisma.clickLog.create({
            data: {
                urlId: url.id,
                ip: ipToResolve,
                country: geo?.country || 'Unknown',
                state: geo?.region || 'Unknown',
                city: geo?.city || 'Unknown',
                browser,
                device,
                referrer: req.get('Referrer') || 'Direct',
            }
        });

        res.json({ originalUrl: url.originalUrl });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
