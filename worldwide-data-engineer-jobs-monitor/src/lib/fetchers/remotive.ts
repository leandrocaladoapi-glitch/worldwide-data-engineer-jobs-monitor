import { RawJob } from './types';

export async function fetchRemotive(): Promise<RawJob[]> {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=data');
    if (!res.ok) return [];

    const data = await res.json();
    const jobs = data.jobs || [];

    return jobs.map((job: any) => ({
      title: job.title || '',
      company: job.company_name || '',
      location: job.candidate_required_location || '',
      description: job.description || '',
      url: job.url || '',
      sourceName: 'Remotive',
      sourceUrl: 'https://remotive.com',
      externalId: String(job.id),
      salary: job.salary || '',
      publishedAt: job.publication_date ? new Date(job.publication_date) : undefined,
      rawPayloadJson: JSON.stringify(job),
    }));
  } catch (error) {
    console.error('Error fetching from Remotive:', error);
    return [];
  }
}
