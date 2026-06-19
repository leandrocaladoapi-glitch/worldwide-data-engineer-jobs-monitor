import { XMLParser } from 'fast-xml-parser';
import { RawJob } from './types';

export async function fetchWWR(): Promise<RawJob[]> {
  try {
    const res = await fetch('https://weworkremotely.com/categories/remote-data-jobs.rss');
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser();
    const parsed = parser.parse(xml);

    let items = parsed.rss?.channel?.item || [];
    if (!Array.isArray(items)) {
      items = [items];
    }

    return items.map((item: any) => {
      let company = '';
      let title = item.title || '';

      const parts = title.split(':');
      if (parts.length > 1) {
        company = parts[0].trim();
        title = parts.slice(1).join(':').trim();
      }

      return {
        title: title,
        company: company,
        location: '',
        description: item.description || '',
        url: item.link || '',
        sourceName: 'We Work Remotely',
        sourceUrl: 'https://weworkremotely.com',
        externalId: item.guid || item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        rawPayloadJson: JSON.stringify(item),
      };
    });
  } catch (error) {
    console.error('Error fetching from WWR:', error);
    return [];
  }
}
