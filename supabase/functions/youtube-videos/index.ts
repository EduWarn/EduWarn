// Fetches EduWarn Nepal videos: 1 live (if any), 1 most-popular, 2 latest.
// Requires the YOUTUBE_API_KEY edge secret.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const CHANNEL_HANDLE = 'EduWarn-Nepal';
const CHANNEL_URL = 'https://www.youtube.com/@EduWarn-Nepal';
const YT = 'https://www.googleapis.com/youtube/v3';

interface VideoOut {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
  label: 'live' | 'popular' | 'latest';
  isLive?: boolean;
}

// module-level memo cache (per warm worker) — 10 min
let cache: { ts: number; body: unknown } | null = null;
const TTL_MS = 10 * 60 * 1000;

async function jget(url: string) {
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) throw new Error(`YouTube ${r.status}: ${JSON.stringify(j?.error ?? j)}`);
  return j;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (cache && Date.now() - cache.ts < TTL_MS) {
      return new Response(JSON.stringify(cache.body), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const key = Deno.env.get('YOUTUBE_API_KEY');
    if (!key) {
      return new Response(
        JSON.stringify({ error: 'YOUTUBE_API_KEY not configured', videos: [], channelUrl: CHANNEL_URL }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1. Resolve channel + uploads playlist
    const ch = await jget(
      `${YT}/channels?part=contentDetails,snippet&forHandle=${CHANNEL_HANDLE}&key=${key}`,
    );
    const channel = ch.items?.[0];
    if (!channel) throw new Error('Channel not found');
    const channelId: string = channel.id;
    const uploadsPlaylist: string = channel.contentDetails.relatedPlaylists.uploads;
    const channelTitle: string = channel.snippet?.title ?? 'EduWarn Nepal';

    // 2. Latest 10 uploads (we'll pick 2 non-live latest + also use to find popular)
    const uploads = await jget(
      `${YT}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylist}&maxResults=15&key=${key}`,
    );
    const uploadIds: string[] = (uploads.items ?? [])
      .map((i: any) => i.contentDetails?.videoId)
      .filter(Boolean);

    // 3. Get stats for those uploads
    let popular: VideoOut | null = null;
    let latestVideos: VideoOut[] = [];
    if (uploadIds.length) {
      const stats = await jget(
        `${YT}/videos?part=snippet,statistics,liveStreamingDetails&id=${uploadIds.join(',')}&key=${key}`,
      );
      const items = (stats.items ?? []).map((v: any): VideoOut & { views: number } => ({
        id: v.id,
        title: v.snippet.title,
        thumbnail:
          v.snippet.thumbnails?.maxres?.url ??
          v.snippet.thumbnails?.high?.url ??
          `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        publishedAt: v.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        label: 'latest',
        views: Number(v.statistics?.viewCount ?? 0),
      }));

      const byViews = [...items].sort((a, b) => b.views - a.views);
      popular = byViews[0] ? { ...byViews[0], label: 'popular' } : null;

      const byDate = [...items].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
      latestVideos = byDate.filter((v) => v.id !== popular?.id).slice(0, 2);
    }

    // 4. Live check
    let live: VideoOut | null = null;
    try {
      const liveSearch = await jget(
        `${YT}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${key}`,
      );
      const l = liveSearch.items?.[0];
      if (l?.id?.videoId) {
        live = {
          id: l.id.videoId,
          title: l.snippet.title,
          thumbnail:
            l.snippet.thumbnails?.high?.url ??
            `https://i.ytimg.com/vi/${l.id.videoId}/hqdefault.jpg`,
          publishedAt: l.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${l.id.videoId}`,
          label: 'live',
          isLive: true,
        };
      }
    } catch (_) { /* ignore live errors */ }

    const body = {
      channelTitle,
      channelUrl: CHANNEL_URL,
      live,
      popular,
      latest: latestVideos,
    };

    cache = { ts: Date.now(), body };
    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('youtube-videos error:', e);
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Unknown error', videos: [], channelUrl: CHANNEL_URL }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
