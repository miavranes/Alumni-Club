import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const healthCheck = async (req: Request, res: Response) => {
    try {
        // Check database connection
        await prisma.$connect();
        res.status(200).json({ status: 'UP' });
    } catch (error: unknown) {
    const message =
        error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({ status: 'DOWN', error: message });
    }
    finally {
        await prisma.$disconnect();
    }
};