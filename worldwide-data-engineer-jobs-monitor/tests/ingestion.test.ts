import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runIngestion } from '@/lib/ingest';
import { prisma } from '@/lib/prisma';
import * as remotive from '@/lib/fetchers/remotive';
import * as remoteok from '@/lib/fetchers/remoteok';
import * as wwr from '@/lib/fetchers/wwr';
import * as jobicy from '@/lib/fetchers/jobicy';
import * as arbeitnow from '@/lib/fetchers/arbeitnow';
import * as hackernews from '@/lib/fetchers/hackernews';

// Mock the prisma client to avoid DB writes during this specific logic test
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      ingestionRun: {
        create: vi.fn().mockResolvedValue({ id: 'test-run-id' }),
        update: vi.fn().mockResolvedValue({}),
      },
      job: {
        upsert: vi.fn().mockResolvedValue({}),
      }
    }
  };
});

describe('Ingestion Rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetchers to return empty arrays by default
    vi.spyOn(remotive, 'fetchRemotive').mockResolvedValue([]);
    vi.spyOn(remoteok, 'fetchRemoteOK').mockResolvedValue([]);
    vi.spyOn(wwr, 'fetchWWR').mockResolvedValue([]);
    vi.spyOn(jobicy, 'fetchJobicy').mockResolvedValue([]);
    vi.spyOn(arbeitnow, 'fetchArbeitnow').mockResolvedValue([]);
    vi.spyOn(hackernews, 'fetchHackerNews').mockResolvedValue([]);
  });

  it('fails ingestion if accepted jobs < 30', async () => {
    // Generate 10 valid jobs
    const mockJobs = Array.from({ length: 10 }).map((_, i) => ({
      title: 'Data Engineer',
      company: `Company ${i}`,
      location: 'Worldwide',
      description: 'Work anywhere',
      url: `http://test.com/job/${i}`,
      sourceName: 'MockSource',
      rawPayloadJson: '{}',
    }));

    vi.spyOn(remotive, 'fetchRemotive').mockResolvedValue(mockJobs);

    const result = await runIngestion();

    expect(result.success).toBe(false);
    expect(result.totalAccepted).toBe(10);
    expect(result.failureReason).toContain('Not enough qualified worldwide Data Engineer jobs found. Minimum required: 30');

    expect(prisma.ingestionRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          success: false,
        })
      })
    );
  });

  it('succeeds ingestion if accepted jobs >= 30', async () => {
    // Generate 30 valid jobs
    const mockJobs = Array.from({ length: 30 }).map((_, i) => ({
      title: 'Data Engineer',
      company: `Company ${i}`,
      location: 'Worldwide',
      description: 'Work anywhere',
      url: `http://test.com/job/${i}`,
      sourceName: 'MockSource',
      rawPayloadJson: '{}',
    }));

    vi.spyOn(remotive, 'fetchRemotive').mockResolvedValue(mockJobs);

    const result = await runIngestion();

    expect(result.success).toBe(true);
    expect(result.totalAccepted).toBe(30);
    expect(result.failureReason).toBeNull();

    expect(prisma.ingestionRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          success: true,
        })
      })
    );
  });
});
