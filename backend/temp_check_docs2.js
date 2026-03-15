const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ess = await prisma.essentialDocument.findMany({
    select: { id: true, title: true, trashed: true, createdAt: true }
  });

  const certs = await prisma.certificate.findMany({
    select: { id: true, issuingAgency: true, suppliedItems: true, trashed: true, createdAt: true }
  });

  console.log(`Total Essential: ${ess.length}`);
  console.log(JSON.stringify(ess, null, 2));
  
  console.log(`Total Certificates: ${certs.length}`);
  console.log(JSON.stringify(certs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
