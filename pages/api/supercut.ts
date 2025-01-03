import { NextApiRequest, NextApiResponse } from "next";
import { getSubtitles } from "youtube-captions-scraper";

// Function to scrape subtitles using youtube-captions-scraper
async function scrapeSubtitles(
  videoId: string
): Promise<{ start: number; dur: number; text: string }[] | null> {
  try {
    const data = await getSubtitles({
      videoID: videoId,
      lang: "en",
    });
    return data;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return null;
  }
}

// Function to parse subtitles (SRT format) and extract segments matching keywords
function findSegments(
  subtitles: { start: number; dur: number; text: string }[],
  keywords: string[]
): { start: number; end: number; text: string }[] {
  const segments: { start: number; end: number; text: string }[] = [];

  for (const block of subtitles) {
    const { start, dur, text } = block;
    const end = start + dur;

    if (
      keywords.some((keyword) =>
        text.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      segments.push({ start, end, text });
    }
  }
  return segments;
}

// API Route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { videoUrl, keywords } = req.body;
  if (!videoUrl || !keywords) {
    return res.status(400).json({ error: "Missing videoUrl or keywords" });
  }

  const videoId = new URL(videoUrl).searchParams.get("v");

  if (!videoId) {
    return res.status(400).json({ error: "Invalid video URL" });
  }

  // Fetch subtitles and filter by keywords
  const subtitles = await scrapeSubtitles(videoId);
  if (!subtitles) {
    return res.status(404).json({ error: "No subtitles found for this video" });
  }

  const segments = findSegments(subtitles, keywords.split(","));
  return res.status(200).json({ segments });
}
