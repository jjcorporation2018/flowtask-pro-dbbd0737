import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://polaryon:Jaguar2018jolela%23@204.168.151.231:5432/polaryon_db?schema=public"
        }
    }
});

async function main() {
    const users = await prisma.user.findMany({
        where: { email: { in: ['jefersonmoraes72@gmail.com', 'jjcorporation2018@gmail.com', 'jefersonvilela72@gmail.com', 'jeferson99jeferson@gmail.com'] } }
    });
    console.log("Database user objects:", JSON.stringify(users.map(user => ({ ...user, picture: user.picture ? `[BASE64 SIZE: ${user.picture.length}]` : null })), null, 2));
    
    // Also simulate the exact query from kanban/sync
    const allUsers = await prisma.user.findMany({
        where: { role: { notIn: ['disabled', 'pending'] } }
    });
    // Check documents
    const docCount = await prisma.companyDocument.count();
    const essentialCount = await prisma.essentialDocument.count();
    console.log(`Documents count: Company=${docCount}, Essential=${essentialCount}`);
}

main().finally(() => prisma.$disconnect());
