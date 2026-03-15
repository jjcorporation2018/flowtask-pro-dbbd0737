import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://polaryon:Jaguar2018jolela%23@204.168.151.231:5432/polaryon_db?schema=public"
        }
    }
});

async function main() {
    const email = 'jeferson99jeferson@gmail.com';
    const user = await prisma.user.update({
        where: { email },
        data: {
            role: 'admin',
            permissions: {
                canView: true,
                canEdit: true,
                canDownload: true,
                allowedScreens: ['ALL']
            }
        }
    });
    console.log("User updated in DB:", user.email, "Role:", user.role);
}

main().finally(() => prisma.$disconnect());
