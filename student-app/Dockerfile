# 🐳 THE CHALLENGE: this Dockerfile is broken. Make the app build and run.
#
#   docker build -t docker-game .
#   docker run -p 3000:3000 -e LEADERBOARD_URL=<your-instructor-url> docker-game
#   → http://localhost:3000
#
# It has a handful of problems: some things are wrong, some are missing.
# Figure out what a Node app needs to install its deps, listen on port 3000,
# and start — then fix it. (Peek at package.json if you get stuck.)
#
# Stuck? A more heavily-hinted version lives in Dockerfile-hints:
#   docker build -f Dockerfile-hints -t docker-game .
# ---------------------------------------------------------------------------

FROM node

COPY . .

CMD ["node", "index.js"]
