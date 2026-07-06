const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// The shared leaderboard server (your instructor's Vercel URL).
// It is passed in at runtime with:  docker run -e LEADERBOARD_URL=https://...
const LEADERBOARD_URL = process.env.LEADERBOARD_URL || "";

// Serve the game UI (public/index.html, style.css, app.js).
app.use(express.static(path.join(__dirname, "public")));

// Tiny config script the browser loads to learn where the leaderboard lives.
// Injected from the environment so students SEE why `-e LEADERBOARD_URL` matters.
app.get("/config.js", (_req, res) => {
  res.type("application/javascript");
  res.send(`window.LEADERBOARD_URL = ${JSON.stringify(LEADERBOARD_URL)};`);
});

app.listen(PORT, () => {
  console.log(`🐳 Docker Game running at http://localhost:${PORT}`);
  if (!LEADERBOARD_URL) {
    console.log("⚠️  LEADERBOARD_URL is not set — run with:");
    console.log("   docker run -p 3000:3000 -e LEADERBOARD_URL=https://<your>.vercel.app docker-game");
  } else {
    console.log(`   Leaderboard server: ${LEADERBOARD_URL}`);
  }
});
