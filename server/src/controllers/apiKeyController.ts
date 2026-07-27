import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';

export const getApiKeys = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const keys = await prisma.apiKey.findMany({
            where: { userId },
            select: { id: true, name: true, createdAt: true, expiresAt: true, key: true } // Usually you wouldn't return full key, but for simple SaaS we can, or just return first few chars.
        });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
};

export const createApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { name } = req.body;
        
        if (!name) {
            res.status(400).json({ error: 'Key name is required' });
            return;
        }

        const keyString = 'qk_' + uuidv4().replace(/-/g, '');

        const apiKey = await prisma.apiKey.create({
            data: {
                userId,
                name,
                key: keyString
            }
        });

        res.status(201).json(apiKey);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create API key' });
    }
};

export const deleteApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        await prisma.apiKey.deleteMany({
            where: {
                id,
                userId
            }
        });

        res.json({ message: 'API Key revoked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
};
