import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

import authRoutes from './routes/auth';

// Security and Parsing Middlewares
app.use(helmet());
app.use(cors({
    origin: '*', // To be restricted in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic Health Check Route
app.get('/health', async (req: Request, res: Response) => {
    try {
        // Ping DB to test connection
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'OK', message: 'Polaryon Backend is alive and DB is connected!' });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ status: 'ERROR', message: 'API is running but DB is disconnected.' });
    }
});

// API Routes
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Polaryon Backend Kernel running on port ${PORT}`);
});
