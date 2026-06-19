import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bySource = await prisma.job.groupBy({
    by: ['sourceName', 'status'],
    _count: { sourceName: true }
  });

  const summary: Record<string, { fetched: number, accepted: number, rejected: number, duplicate: number, invalid: number }> = {};

  bySource.forEach(row => {
    if (!summary[row.sourceName]) summary[row.sourceName] = { fetched: 0, accepted: 0, rejected: 0, duplicate: 0, invalid: 0 };
    summary[row.sourceName].fetched += row._count.sourceName;

    if (row.status === 'ACCEPTED') summary[row.sourceName].accepted = row._count.sourceName;
    if (row.status === 'REJECTED') summary[row.sourceName].rejected = row._count.sourceName;
    if (row.status === 'DUPLICATE') summary[row.sourceName].duplicate = row._count.sourceName;
    if (row.status === 'INVALID') summary[row.sourceName].invalid = row._count.sourceName;
  });

  console.table(summary);
}
main();
