import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// COMPANY DOCUMENTS
// ==========================================

router.get('/company', async (req: Request, res: Response) => {
    try {
        const docs = await prisma.companyDocument.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(docs);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/company', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        // Convert strings to Dates if necessary
        if (data.issueDate) data.issueDate = new Date(data.issueDate);
        if (data.expirationDate) data.expirationDate = new Date(data.expirationDate);
        
        const doc = await prisma.companyDocument.create({ data });
        res.json(doc);
    } catch (e: any) {
        console.error("Company Document Create Error:", e);
        res.status(500).json({ error: e.message });
    }
});

router.put('/company/:id', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        if (data.issueDate) data.issueDate = new Date(data.issueDate);
        if (data.expirationDate) data.expirationDate = new Date(data.expirationDate);

        const doc = await prisma.companyDocument.update({
            where: { id: req.params.id as string },
            data
        });
        res.json(doc);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/company/:id', async (req: Request, res: Response) => {
    try {
        await prisma.companyDocument.delete({
            where: { id: req.params.id as string }
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// ESSENTIAL DOCUMENTS (MODELS)
// ==========================================

router.get('/essential', async (req: Request, res: Response) => {
    try {
        const models = await prisma.essentialDocument.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(models);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/essential', async (req: Request, res: Response) => {
    try {
        const doc = await prisma.essentialDocument.create({ data: req.body });
        res.json(doc);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/essential/:id', async (req: Request, res: Response) => {
    try {
        const doc = await prisma.essentialDocument.update({
            where: { id: req.params.id as string },
            data: req.body
        });
        res.json(doc);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/essential/:id', async (req: Request, res: Response) => {
    try {
        await prisma.essentialDocument.delete({
            where: { id: req.params.id as string }
        });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
