import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    where: { status: 'ACCEPTED' },
    select: { title: true, company: true, sourceName: true, worldwideEvidenceQuote: true, roleEvidenceQuote: true, url: true }
  });
  console.table(jobs);
}
main();
