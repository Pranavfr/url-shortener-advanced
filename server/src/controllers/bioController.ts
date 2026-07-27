import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getBioPage = async (req: Request, res: Response): Promise<void> => {
    try {
        const bioPage = await prisma.bioPage.findUnique({
            where: { userId: req.user!.userId },
            include: { links: { orderBy: { order: 'asc' } } }
        });
        res.json(bioPage);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch bio page' });
    }
};

export const updateBioPage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, title, description, theme, links } = req.body;
        const userId = req.user!.userId;

        // Check if username is taken
        const existingUser = await prisma.bioPage.findFirst({ where: { username } });
        if (existingUser && existingUser.userId !== userId) {
            res.status(400).json({ error: 'Username is already taken' });
            return;
        }

        const bioPage = await prisma.bioPage.upsert({
            where: { userId },
            update: { username, title, description, theme },
            create: { userId, username, title, description, theme }
        });

        // Update links
        await prisma.bioLink.deleteMany({ where: { bioPageId: bioPage.id } });
        
        if (links && Array.isArray(links)) {
            for (let i = 0; i < links.length; i++) {
                await prisma.bioLink.create({
                    data: {
                        bioPageId: bioPage.id,
                        title: links[i].title,
                        url: links[i].url,
                        icon: links[i].icon,
                        order: i
                    }
                });
            }
        }

        res.json(bioPage);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update bio page' });
    }
};

export const getPublicBioPage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.params;
        const bioPage = await prisma.bioPage.findUnique({
            where: { username },
            include: { links: { orderBy: { order: 'asc' } } }
        });
        
        if (!bioPage) {
            res.status(404).json({ error: 'Bio page not found' });
            return;
        }
        
        res.json(bioPage);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch public bio page' });
    }
};
