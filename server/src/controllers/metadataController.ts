import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Folders
export const getFolders = async (req: Request, res: Response): Promise<void> => {
    try {
        const folders = await prisma.folder.findMany({ where: { userId: req.user!.userId } });
        res.json(folders);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
};

export const createFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const folder = await prisma.folder.create({
            data: { name, userId: req.user!.userId }
        });
        res.json(folder);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
};

export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.folder.deleteMany({ where: { id, userId: req.user!.userId } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
};

// Tags
export const getTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const tags = await prisma.tag.findMany({ where: { userId: req.user!.userId } });
        res.json(tags);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, color } = req.body;
        const tag = await prisma.tag.create({
            data: { name, color: color || '#818cf8', userId: req.user!.userId }
        });
        res.json(tag);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.tag.deleteMany({ where: { id, userId: req.user!.userId } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete tag' });
    }
};
