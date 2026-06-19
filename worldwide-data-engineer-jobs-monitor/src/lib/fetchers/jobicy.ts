import { RawJob } from './types';

export async function fetchJobicy(): Promise<RawJob[]> {
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?industry=engineering');
    if (!res.ok) return [];

    const data = await res.json();
    const jobs = data.jobs || [];

    return jobs.map((job: any) => ({
      title: job.jobTitle || '',
      company: job.companyName || '',
      location: job.jobGeo || '',
      description: job.jobDescription || '',
      url: job.url || '',
      sourceName: 'Jobicy',
      sourceUrl: 'https://jobicy.com',
      externalId: String(job.id),
      publishedAt: job.pubDate ? new Date(job.pubDate) : undefined,
      rawPayloadJson: JSON.stringify(job),
    }));
  } catch (error) {
    console.error('Error fetching from Jobicy:', error);
    return [];
  }
}
