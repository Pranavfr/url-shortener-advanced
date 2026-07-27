import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Folders
export const getFolders = async (req: Request, res: Response): Promise<void> => {
    try {
        const folders = await prisma.folder.findMany({ where: { userId: req.user.id } });
        res.json(folders);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const folder = await prisma.folder.create({
            data: { name, userId: req.user.id }
        });
        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.folder.deleteMany({ where: { id, userId: req.user.id } });
        res.json({ message: 'Folder deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Tags
export const getTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const tags = await prisma.tag.findMany({ where: { userId: req.user.id } });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, color } = req.body;
        const tag = await prisma.tag.create({
            data: { name, color: color || '#818cf8', userId: req.user.id }
        });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.tag.deleteMany({ where: { id, userId: req.user.id } });
        res.json({ message: 'Tag deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
