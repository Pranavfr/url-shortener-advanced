import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const redirectUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortCode } = req.params;
        
        const url = await prisma.url.findUnique({
            where: { shortCode }
        });

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

        await prisma.clickLog.create({
            data: {
                urlId: url.id,
                ip: req.ip || req.socket.remoteAddress,
                browser,
                device,
                referrer: req.get('Referrer') || 'Direct',
            }
        });

        res.redirect(url.originalUrl);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
