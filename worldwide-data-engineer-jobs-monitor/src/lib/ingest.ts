import { prisma } from './prisma';
import { fetchRemotive } from './fetchers/remotive';
import { fetchRemoteOK } from './fetchers/remoteok';
import { fetchWWR } from './fetchers/wwr';
import { fetchJobicy } from './fetchers/jobicy';
import { fetchArbeitnow } from './fetchers/arbeitnow';
import { fetchHackerNews } from './fetchers/hackernews';
import { validateRole, validateWorldwide } from './validation';
import { RawJob } from './fetchers/types';

export async function runIngestion() {
  const run = await prisma.ingestionRun.create({
    data: {
      startedAt: new Date(),
    },
  });

  try {
    const [remotiveJobs, remoteOkJobs, wwrJobs, jobicyJobs, arbeitnowJobs, hnJobs] = await Promise.all([
      fetchRemotive(),
      fetchRemoteOK(),
      fetchWWR(),
      fetchJobicy(),
      fetchArbeitnow(),
      fetchHackerNews(),
    ]);

    let allRawJobs: RawJob[] = [
      ...remotiveJobs,
      ...remoteOkJobs,
      ...wwrJobs,
      ...jobicyJobs,
      ...arbeitnowJobs,
      ...hnJobs,
    ];

    const totalFetched = allRawJobs.length;
    let totalAccepted = 0;
    let totalRejected = 0;
    let totalDuplicate = 0;
    let totalInvalid = 0;

    const seenIdentifiers = new Set<string>();

    for (const rawJob of allRawJobs) {
      if (!rawJob.title || !rawJob.company) {
        totalInvalid++;
        await saveJob(rawJob, 'INVALID', 'Missing title or company');
        continue;
      }

      const dedupeKeyUrl = rawJob.url?.toLowerCase() || '';
      const dedupeKeyCompTitle = `${rawJob.company.toLowerCase()}|${rawJob.title.toLowerCase()}`;
      const dedupeKeyExt = rawJob.externalId ? `${rawJob.sourceName}|${rawJob.externalId}` : '';

      if (
        (dedupeKeyUrl && seenIdentifiers.has(dedupeKeyUrl)) ||
        seenIdentifiers.has(dedupeKeyCompTitle) ||
        (dedupeKeyExt && seenIdentifiers.has(dedupeKeyExt))
      ) {
        totalDuplicate++;
        await saveJob(rawJob, 'DUPLICATE', 'Duplicate job identified');
        continue;
      }

      if (dedupeKeyUrl) seenIdentifiers.add(dedupeKeyUrl);
      seenIdentifiers.add(dedupeKeyCompTitle);
      if (dedupeKeyExt) seenIdentifiers.add(dedupeKeyExt);

      const roleVal = validateRole(rawJob);
      if (!roleVal.valid) {
        totalRejected++;
        await saveJob(rawJob, 'REJECTED', roleVal.reason);
        continue;
      }

      const worldwideVal = validateWorldwide(rawJob);
      if (!worldwideVal.valid) {
        totalRejected++;
        await saveJob(rawJob, 'REJECTED', worldwideVal.reason, roleVal.evidenceQuote);
        continue;
      }

      totalAccepted++;
      await saveJob(rawJob, 'ACCEPTED', undefined, roleVal.evidenceQuote, worldwideVal.evidenceQuote, 'Passed all gates');
    }

    const success = totalAccepted >= 30;
    const failureReason = success ? null : `Not enough qualified worldwide Data Engineer jobs found. Minimum required: 30. Current accepted: ${totalAccepted}`;

    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        totalFetched,
        totalAccepted,
        totalRejected,
        totalDuplicate,
        totalInvalid,
        success,
        failureReason,
      },
    });

    return {
      runId: run.id,
      success,
      totalFetched,
      totalAccepted,
      totalRejected,
      totalDuplicate,
      totalInvalid,
      failureReason
    };

  } catch (error: any) {
    console.error('Ingestion error:', error);
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        success: false,
        failureReason: `Internal error: ${error.message}`,
      },
    });
    throw error;
  }
}

async function saveJob(
  rawJob: RawJob,
  status: string,
  rejectionReason?: string,
  roleEvidenceQuote?: string,
  worldwideEvidenceQuote?: string,
  acceptedReason?: string
) {
  try {
    await prisma.job.upsert({
      where: { url: rawJob.url || 'missing-url-' + Math.random() },
      update: {
        status,
        rejectionReason,
        roleEvidenceQuote,
        worldwideEvidenceQuote,
        acceptedReason,
      },
      create: {
        title: rawJob.title || 'Untitled',
        company: rawJob.company || 'Unknown',
        location: rawJob.location || '',
        description: rawJob.description || '',
        url: rawJob.url || 'missing-url-' + Math.random(),
        sourceName: rawJob.sourceName,
        sourceUrl: rawJob.sourceUrl,
        externalId: rawJob.externalId,
        salary: rawJob.salary,
        publishedAt: rawJob.publishedAt,
        rawPayloadJson: rawJob.rawPayloadJson,
        status,
        rejectionReason,
        roleEvidenceQuote,
        worldwideEvidenceQuote,
        acceptedReason,
      }
    });
  } catch (e) {
    console.error('Error saving job:', e);
  }
}
