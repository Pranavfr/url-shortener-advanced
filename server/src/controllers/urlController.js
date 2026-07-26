"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlockUrl = exports.generateQR = exports.deleteUrl = exports.updateUrl = exports.getUrls = exports.createUrl = void 0;
const express_1 = require("express");
const qrcode_1 = __importDefault(require("qrcode"));
const prisma_1 = require("../utils/prisma");
const cppInvoker_1 = require("../utils/cppInvoker");
const zod_1 = require("zod");
const createUrlSchema = zod_1.z.object({
    originalUrl: zod_1.z.string().url(),
    customAlias: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
});
const createUrl = async (req, res) => {
    try {
        const { originalUrl, customAlias, expiresAt, password } = createUrlSchema.parse(req.body);
        const userId = req.user.id;
        let shortCode = customAlias;
        if (customAlias) {
            const existing = await prisma_1.prisma.url.findFirst({ where: { OR: [{ shortCode: customAlias }, { customAlias }] } });
            if (existing) {
                res.status(400).json({ error: 'Custom alias already in use' });
                return;
            }
        }
        else {
            // Use C++ DSA Module to generate code
            shortCode = await cppInvoker_1.cppInvoker.generateUnique(originalUrl);
        }
        const url = await prisma_1.prisma.url.create({
            data: {
                originalUrl,
                shortCode: shortCode,
                customAlias,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                password,
                userId
            }
        });
        res.status(201).json(url);
    }
    catch (error) {
        res.status(400).json({ error: error.errors || error.message });
    }
};
exports.createUrl = createUrl;
const getUrls = async (req, res) => {
    try {
        const urls = await prisma_1.prisma.url.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(urls);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getUrls = getUrls;
const updateUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { isDisabled } = req.body;
        const url = await prisma_1.prisma.url.findUnique({ where: { id } });
        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }
        const updated = await prisma_1.prisma.url.update({
            where: { id },
            data: { isDisabled }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateUrl = updateUrl;
const deleteUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await prisma_1.prisma.url.findUnique({ where: { id } });
        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }
        await prisma_1.prisma.clickLog.deleteMany({ where: { urlId: id } });
        await prisma_1.prisma.url.delete({ where: { id } });
        res.json({ message: 'URL deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteUrl = deleteUrl;
const generateQR = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await prisma_1.prisma.url.findUnique({ where: { id } });
        if (!url || url.userId !== req.user.id) {
            res.status(404).json({ error: 'URL not found' });
            return;
        }
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const fullUrl = `${baseUrl}/${url.shortCode}`; // In production, use env var
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(fullUrl);
        res.json({ qrCode: qrCodeDataUrl });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.generateQR = generateQR;
const unlockUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const { password } = req.body;
        const url = await prisma_1.prisma.url.findUnique({ where: { shortCode } });
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
        const geoip = require('geoip-lite');
        const clientIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '';
        const ipToResolve = clientIp.split(',')[0].trim();
        const geo = geoip.lookup(ipToResolve);
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
        res.json({ originalUrl: url.originalUrl });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.unlockUrl = unlockUrl;
//# sourceMappingURL=urlController.js.map