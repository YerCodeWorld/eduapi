import { PrismaClient } from '@prisma/client';

// Simple singleton pattern for PrismaClient
let prismaInstance: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
            log: ['query', 'error', 'warn'],
        });
    }
    return prismaInstance;
}

const prisma = getPrismaClient();

export default prisma;