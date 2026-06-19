import { RawJob } from './types';

export async function fetchArbeitnow(): Promise<RawJob[]> {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (!res.ok) return [];

    const data = await res.json();
    const jobs = data.data || [];

    return jobs.map((job: any) => ({
      title: job.title || '',
      company: job.company_name || '',
      location: job.location || '',
      description: job.description || '',
      url: job.url || '',
      sourceName: 'Arbeitnow',
      sourceUrl: 'https://www.arbeitnow.com',
      externalId: job.slug,
      publishedAt: job.created_at ? new Date(job.created_at * 1000) : undefined,
      rawPayloadJson: JSON.stringify(job),
    }));
  } catch (error) {
    console.error('Error fetching from Arbeitnow:', error);
    return [];
  }
}
