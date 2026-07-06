import { randomUUID } from "node:crypto";
import { redis, LEADERBOARD, entryKey, applyCors, readJsonBody } from "../lib/redis.js";

const MAX_NAME = 40;
const MAX_URL = 500;

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const entries = await listEntries();
      return res.status(200).json({ entries });
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const name = String(body.name ?? "").trim().slice(0, MAX_NAME);
      const gifUrl = String(body.gifUrl ?? "").trim().slice(0, MAX_URL);

      if (!name) return res.status(400).json({ error: "Name is required." });
      if (!/^https?:\/\//i.test(gifUrl)) {
        return res.status(400).json({ error: "gifUrl must start with http(s)://" });
      }

      const id = randomUUID();
      await redis.hset(entryKey(id), { name, gifUrl });
      // Start every player at 0 votes.
      await redis.zadd(LEADERBOARD, { score: 0, member: id });

      return res.status(201).json({ id, name, gifUrl, votes: 0 });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("entries handler failed:", err);
    return res.status(500).json({ error: "Server error. Is the KV store connected?" });
  }
}

// Returns players sorted by votes (highest first).
async function listEntries() {
  // ZRANGE ... REV WITHSCORES -> flat array: [member, score, member, score, ...]
  const flat = await redis.zrange(LEADERBOARD, 0, -1, { rev: true, withScores: true });
  if (!flat || !flat.length) return [];

  const ids = [];
  const votesById = {};
  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i];
    const votes = Number(flat[i + 1]) || 0;
    ids.push(id);
    votesById[id] = votes;
  }

  const hashes = await Promise.all(ids.map((id) => redis.hgetall(entryKey(id))));

  return ids
    .map((id, i) => {
      const data = hashes[i];
      if (!data || !data.name) return null; // hash expired/deleted but still in set
      return { id, name: data.name, gifUrl: data.gifUrl, votes: votesById[id] };
    })
    .filter(Boolean);
}
