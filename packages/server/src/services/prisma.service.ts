// server/src/services/prisma.service.ts

import { PrismaClient } from '@prisma/client';

// We use a global variable to ensure only one instance of PrismaClient is initialized.
const prisma = new PrismaClient();

// This function can be called to safely connect to the database.
async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully.');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

export { prisma, connectToDatabase };