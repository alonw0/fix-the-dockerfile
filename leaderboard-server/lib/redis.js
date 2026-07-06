import { Redis } from "@upstash/redis";

// Works with BOTH the Vercel "KV" integration (KV_REST_API_*) and the
// Upstash Redis Marketplace integration (UPSTASH_REDIS_REST_*).
// Vercel injects these env vars automatically once you connect a store.
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Redis keys
export const LEADERBOARD = "leaderboard"; // sorted set: member = id, score = votes
export const entryKey = (id) => `entry:${id}`; // hash: { name, gifUrl }

// Shared CORS helper. The student app runs on http://localhost:3000, a different
// origin from this server, so the browser needs these headers to allow the calls.
export function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Reads a JSON body whether Vercel already parsed it or handed us a raw stream.
export async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}
