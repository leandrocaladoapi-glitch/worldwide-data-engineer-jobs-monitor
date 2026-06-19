import { RawJob } from './types';

export async function fetchHackerNews(): Promise<RawJob[]> {
  try {
    const query = encodeURIComponent('"Data Engineer"');
    const res = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${query}&tags=comment&hitsPerPage=50`);
    if (!res.ok) return [];

    const data = await res.json();
    const hits = data.hits || [];

    return hits.map((hit: any) => {
      const text = hit.comment_text || '';
      const firstLine = text.split('\n')[0].replace(/<[^>]+>/g, '').trim();

      return {
        title: 'Hacker News Comment (Possible Data Engineer)',
        company: firstLine.substring(0, 50),
        location: '',
        description: text,
        url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        sourceName: 'Hacker News',
        sourceUrl: 'https://news.ycombinator.com',
        externalId: String(hit.objectID),
        publishedAt: hit.created_at ? new Date(hit.created_at) : undefined,
        rawPayloadJson: JSON.stringify(hit),
      };
    });
  } catch (error) {
    console.error('Error fetching from HackerNews:', error);
    return [];
  }
}
