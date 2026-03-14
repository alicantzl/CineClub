/* eslint-disable @typescript-eslint/no-explicit-any */
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
  if (!query) return [];

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API Key is missing");
    throw new Error("YouTube API Key eksik.");
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.items) {
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
      }));
    }
    return [];
  } catch (error) {
    console.error("YouTube Arama Hatası:", error);
    return [];
  }
};
