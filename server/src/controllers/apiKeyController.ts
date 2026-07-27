import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';

export const getApiKeys = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const keys = await prisma.apiKey.findMany({ where: { userId } });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        
        // Generate a random key
        const keyString = 'qk_' + crypto.randomBytes(24).toString('hex');
        
        const key = await prisma.apiKey.create({
            data: {
                name,
                key: keyString,
                userId
            }
        });
        
        // Only return full key on creation
        res.status(201).json(key);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const key = await prisma.apiKey.findFirst({ where: { id, userId } });
        
        if (!key) {
            res.status(404).json({ error: 'API key not found' });
            return;
        }

        await prisma.apiKey.delete({ where: { id } });
        res.json({ message: 'API key deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
