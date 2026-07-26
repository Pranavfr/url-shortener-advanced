"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const getAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await prisma_1.prisma.url.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=analyticsController.js.map