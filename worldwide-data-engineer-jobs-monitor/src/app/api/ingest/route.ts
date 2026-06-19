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
