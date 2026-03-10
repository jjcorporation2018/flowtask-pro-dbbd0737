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

// COMPANIES
router.get('/companies', async (req: Request, res: Response) => {
    try {
        const companies = await prisma.company.findMany();
        res.json(companies);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/companies', async (req: Request, res: Response) => {
    try {
        const company = await prisma.company.create({ data: req.body });
        res.json(company);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/companies/:id', async (req: Request, res: Response) => {
    try {
        const company = await prisma.company.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(company);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/companies/:id', async (req: Request, res: Response) => {
    try {
        await prisma.company.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// MAIN COMPANY PROFILES
router.get('/main-companies', async (req: Request, res: Response) => {
    try {
        const mainCompanies = await prisma.mainCompanyProfile.findMany();
        res.json(mainCompanies);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/main-companies', async (req: Request, res: Response) => {
    try {
        const mainComp = await prisma.mainCompanyProfile.create({ data: req.body });
        res.json(mainComp);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/main-companies/:id', async (req: Request, res: Response) => {
    try {
        const mainComp = await prisma.mainCompanyProfile.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(mainComp);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/main-companies/:id', async (req: Request, res: Response) => {
    try {
        await prisma.mainCompanyProfile.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ROUTES
router.get('/routes', async (req: Request, res: Response) => {
    try {
        const routes = await prisma.route.findMany();
        res.json(routes);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/routes', async (req: Request, res: Response) => {
    try {
        const route = await prisma.route.create({ data: req.body });
        res.json(route);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/routes/:id', async (req: Request, res: Response) => {
    try {
        const route = await prisma.route.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(route);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/routes/:id', async (req: Request, res: Response) => {
    try {
        await prisma.route.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// BUDGETS
router.get('/budgets', async (req: Request, res: Response) => {
    try {
        const budgets = await prisma.budget.findMany();
        res.json(budgets);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/budgets', async (req: Request, res: Response) => {
    try {
        const budget = await prisma.budget.create({ data: req.body });
        res.json(budget);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/budgets/:id', async (req: Request, res: Response) => {
    try {
        const budget = await prisma.budget.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(budget);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/budgets/:id', async (req: Request, res: Response) => {
    try {
        await prisma.budget.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// NOTIFICATIONS
router.get('/notifications', async (req: Request, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany();
        res.json(notifications);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/notifications', async (req: Request, res: Response) => {
    try {
        const notification = await prisma.notification.create({ data: req.body });
        res.json(notification);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/notifications/:id', async (req: Request, res: Response) => {
    try {
        const notification = await prisma.notification.update({ where: { id: req.params.id as string }, data: req.body });
        res.json(notification);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/notifications/:id', async (req: Request, res: Response) => {
    try {
        await prisma.notification.delete({ where: { id: req.params.id as string } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// SYNC ALL (Pull state to client)
router.get('/sync', async (req: Request, res: Response) => {
    try {
        const [folders, boards, lists, cards, companies, mainCompanies, routes, budgets, notifications] = await Promise.all([
            prisma.folder.findMany(),
            prisma.board.findMany(),
            prisma.kanbanList.findMany(),
            prisma.card.findMany({
                include: { checklist: true, comments: true, attachments: true, milestones: true }
            }),
            prisma.company.findMany(),
            prisma.mainCompanyProfile.findMany(),
            prisma.route.findMany(),
            prisma.budget.findMany(),
            prisma.notification.findMany(),
        ]);

        res.json({ folders, boards, lists, cards, companies, mainCompanies, routes, budgets, notifications });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
