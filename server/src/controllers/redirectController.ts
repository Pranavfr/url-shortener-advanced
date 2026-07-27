import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import geoip from 'geoip-lite';
import redisClient from '../utils/redis';

export const redirectUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortCode } = req.params;
        
        let url: any = null;
        const cachedUrl = await redisClient.get(`url:${shortCode}`);
        
        if (cachedUrl) {
            url = JSON.parse(cachedUrl);
        } else {
            url = await prisma.url.findUnique({
                where: { shortCode }
            });
            if (url) {
                // Cache for 1 hour
                await redisClient.setEx(`url:${shortCode}`, 3600, JSON.stringify(url));
            }
        }

        if (!url) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }

        if (url.isDisabled) {
            res.status(403).json({ error: 'URL is disabled' });
            return;
        }

        if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
            res.status(410).json({ error: 'URL has expired' });
            return;
        }

        // If URL is password protected, redirect to unlock page
        if (url.password) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/unlock/${shortCode}`);
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
        let os = 'Unknown';
        if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
        if (/Android/i.test(userAgent)) os = 'Android';
        if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';

        const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';
        const ipToResolve = clientIp.split(',')[0].trim();
        const geo = geoip.lookup(ipToResolve);

        // Smart Routing Logic
        let destinationUrl = url.originalUrl;
        if (os === 'iOS' && url.iosUrl) {
            destinationUrl = url.iosUrl;
        } else if (os === 'Android' && url.androidUrl) {
            destinationUrl = url.androidUrl;
        } else if (url.geoRouting && geo?.country) {
            try {
                const geoMap = JSON.parse(url.geoRouting);
                if (geoMap[geo.country]) {
                    destinationUrl = geoMap[geo.country];
                }
            } catch (e) {
                // Ignore invalid JSON
            }
        }

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

        res.redirect(destinationUrl);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
