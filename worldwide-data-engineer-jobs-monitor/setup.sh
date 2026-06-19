cd /app/worldwide-data-engineer-jobs-monitor
mkdir -p src/app/api/ingest
mkdir -p src/app/api/jobs/accepted
mkdir -p src/app/api/jobs/rejected
mkdir -p src/app/api/logs
mkdir -p src/components
mkdir -p src/app/admin

cat << 'INNEREOF' > src/app/api/ingest/route.ts
import { NextResponse } from 'next/server';
import { runIngestion } from '@/lib/ingest';

export async function POST() {
  try {
    const result = await runIngestion();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
INNEREOF

cat << 'INNEREOF' > src/app/api/jobs/accepted/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'ACCEPTED' },
      orderBy: { discoveredAt: 'desc' },
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
INNEREOF

cat << 'INNEREOF' > src/app/api/jobs/rejected/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'REJECTED' },
      orderBy: { discoveredAt: 'desc' },
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
INNEREOF

cat << 'INNEREOF' > src/app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.ingestionRun.findMany({
      orderBy: { startedAt: 'desc' },
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
INNEREOF
