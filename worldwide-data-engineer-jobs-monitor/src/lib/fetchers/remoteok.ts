import { RawJob } from './types';

export async function fetchRemoteOK(): Promise<RawJob[]> {
  try {
    const res = await fetch('https://remoteok.com/api?tag=data+engineer');
    if (!res.ok) return [];

    const data = await res.json();
    const jobs = Array.isArray(data) ? data.slice(1) : [];

    return jobs.map((job: any) => ({
      title: job.position || '',
      company: job.company || '',
      location: job.location || '',
      description: job.description || '',
      url: job.url || '',
      sourceName: 'RemoteOK',
      sourceUrl: 'https://remoteok.com',
      externalId: String(job.id),
      salary: `Min: ${job.salary_min}, Max: ${job.salary_max}`,
      publishedAt: job.date ? new Date(job.date) : undefined,
      rawPayloadJson: JSON.stringify(job),
    }));
  } catch (error) {
    console.error('Error fetching from RemoteOK:', error);
    return [];
  }
}
