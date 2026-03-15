import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://polaryon:Jaguar2018jolela%23@204.168.151.231:5432/polaryon_db?schema=public"
        }
    }
});

async function main() {
    console.log("--- MainCompanyProfile ---");
    const mainComps = await prisma.mainCompanyProfile.findMany();
    console.log(JSON.stringify(mainComps, null, 2));

    console.log("--- Company (Contacts) ---");
    const comps = await prisma.company.findMany();
    console.log(JSON.stringify(comps, null, 2));

    console.log("--- Card Attachments ---");
    const attachments = await prisma.attachment.findMany();
    console.log("Count:", attachments.length);
}

main().finally(() => prisma.$disconnect());
