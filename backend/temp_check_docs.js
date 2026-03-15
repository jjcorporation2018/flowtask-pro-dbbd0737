const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.companyDocument.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      status: true,
      expirationDate: true,
      trashed: true,
      createdAt: true
    }
  });

  console.log(`Recent documents found: ${docs.length}`);
  console.log(JSON.stringify(docs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
