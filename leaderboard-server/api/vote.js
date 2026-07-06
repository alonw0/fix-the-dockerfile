import { redis, LEADERBOARD, entryKey, applyCors, readJsonBody } from "../lib/redis.js";

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const id = String(body.id ?? "").trim();
    if (!id) return res.status(400).json({ error: "id is required." });

    // Only count the vote if the player actually exists.
    const exists = await redis.exists(entryKey(id));
    if (!exists) return res.status(404).json({ error: "Player not found." });

    // ZINCRBY is atomic: a whole room clicking at once can't clobber the count.
    const votes = await redis.zincrby(LEADERBOARD, 1, id);

    return res.status(200).json({ id, votes: Number(votes) });
  } catch (err) {
    console.error("vote handler failed:", err);
    return res.status(500).json({ error: "Server error. Is the KV store connected?" });
  }
}
