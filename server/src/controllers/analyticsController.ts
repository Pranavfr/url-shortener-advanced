import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAnalytics = async (req: any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const url = await prisma.url.findUnique({ 
            where: { id },
            include: { ClickLogs: true }
        });

        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        res.json({
            url,
            totalClicks: url.clicks,
            logs: url.ClickLogs
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
