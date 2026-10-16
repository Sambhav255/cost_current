import { loadNHCWithCones } from '../server/nhcFeed.ts';

/** Fixed, read-only same-origin boundary for hosts that support Vercel Functions. */
export async function GET(): Promise<Response> {
  try {
    const body = await loadNHCWithCones();
    return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (error) {
    console.error('NHC endpoint unavailable', error instanceof Error ? error.name : 'unknown');
    return Response.json({ error: 'NHC endpoint unavailable' }, { status: 502 });
  }
}
