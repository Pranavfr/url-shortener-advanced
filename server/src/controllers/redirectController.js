"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectUrl = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const redirectUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const url = await prisma_1.prisma.url.findUnique({
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
        // If URL is password protected, redirect to unlock page
        if (url.password) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/unlock/${shortCode}`);
            return;
        }
        // Increment clicks
        await prisma_1.prisma.url.update({
            where: { id: url.id },
            data: { clicks: { increment: 1 } }
        });
        // Save Analytics
        const userAgent = req.headers['user-agent'] || '';
        let browser = 'Unknown';
        if (userAgent.includes('Chrome'))
            browser = 'Chrome';
        else if (userAgent.includes('Firefox'))
            browser = 'Firefox';
        else if (userAgent.includes('Safari'))
            browser = 'Safari';
        let device = 'Desktop';
        if (/Mobi|Android/i.test(userAgent))
            device = 'Mobile';
        const clientIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        const ipToResolve = clientIp.split(',')[0].trim();
        const geo = geoip_lite_1.default.lookup(ipToResolve);
        await prisma_1.prisma.clickLog.create({
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
        res.redirect(url.originalUrl);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.redirectUrl = redirectUrl;
//# sourceMappingURL=redirectController.js.map