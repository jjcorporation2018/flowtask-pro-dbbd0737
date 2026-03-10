import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// FOLDERS
router.get('/folders', async (req: Request, res: Response) => {
    try {
        const folders = await prisma.folder.findMany({ include: { boards: true } });
        res.json(folders);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/folders', async (req: Request, res: Response) => {
    try {
        const folder = await prisma.folder.create({ data: req.body });
        res.json(folder);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/folders/:id', async (req: Request, res: Response) => {
    try {
        const folder = await prisma.folder.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(folder);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/folders/:id', async (req: Request, res: Response) => {
    try {
        await prisma.folder.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// BOARDS
router.get('/boards', async (req: Request, res: Response) => {
    try {
        const boards = await prisma.board.findMany({ include: { lists: true } });
        res.json(boards);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/boards', async (req: Request, res: Response) => {
    try {
        const board = await prisma.board.create({ data: req.body });
        res.json(board);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/boards/:id', async (req: Request, res: Response) => {
    try {
        const board = await prisma.board.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(board);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/boards/:id', async (req: Request, res: Response) => {
    try {
        await prisma.board.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// LISTS
router.get('/lists', async (req: Request, res: Response) => {
    try {
        const lists = await prisma.kanbanList.findMany({ include: { cards: true } });
        res.json(lists);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/lists', async (req: Request, res: Response) => {
    try {
        const list = await prisma.kanbanList.create({ data: req.body });
        res.json(list);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/lists/:id', async (req: Request, res: Response) => {
    try {
        const list = await prisma.kanbanList.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(list);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/lists/:id', async (req: Request, res: Response) => {
    try {
        await prisma.kanbanList.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// CARDS
router.get('/cards', async (req: Request, res: Response) => {
    try {
        const cards = await prisma.card.findMany({
            include: { labels: true, checklist: true, comments: true, attachments: true, milestones: true }
        });
        res.json(cards);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/cards', async (req: Request, res: Response) => {
    try {
        const card = await prisma.card.create({ data: req.body });
        res.json(card);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/cards/:id', async (req: Request, res: Response) => {
    try {
        const card = await prisma.card.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(card);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/cards/:id', async (req: Request, res: Response) => {
    try {
        await prisma.card.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// SYNC ALL (Pull state to client)
router.get('/sync', async (req: Request, res: Response) => {
    try {
        const [folders, boards, lists, cards] = await Promise.all([
            prisma.folder.findMany(),
            prisma.board.findMany(),
            prisma.kanbanList.findMany(),
            prisma.card.findMany({
                include: { checklist: true, comments: true, attachments: true, milestones: true }
            })
        ]);

        res.json({ folders, boards, lists, cards });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
