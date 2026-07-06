# 🐳 THE CHALLENGE: this Dockerfile is broken. Fix it so the game builds and runs!
#
# When it works:
#   docker build -t docker-game .
#   docker run -p 3000:3000 -e LEADERBOARD_URL=<your-instructor-url> docker-game
#   → open http://localhost:3000
#
# There are 6 bugs below. Each is marked with ❌ and a # TODO hint.
# See CHALLENGES.md for the full walkthrough.
# ---------------------------------------------------------------------------

# ❌ Bug 1: this base image has no version tag. "node" pulls whatever "latest"
#           happens to be today — huge, and it can change under you.
# TODO: pin it to a specific, small image (hint: node:20-alpine).
FROM node

# ❌ Bug 2: no working directory is set, so every command below runs at "/".
# TODO: set a WORKDIR (hint: /app).


# ❌ Bug 3: we copy the WHOLE project before installing dependencies. That means
#           any code change re-runs npm install and wastes Docker's layer cache.
# TODO: copy ONLY package.json + package-lock.json first, install, THEN copy the rest.
COPY . .

# ❌ Bug 4: dependencies are never installed, so `require("express")` will crash.
# TODO: add a RUN step that installs the npm dependencies.


# ❌ Bug 5: the app listens on port 3000, but the image never declares it.
# TODO: EXPOSE the port the app runs on.


# ❌ Bug 6: wrong start command — there is no index.js in this project.
# TODO: point CMD at the real entry file (hint: check "main" in package.json).
CMD ["node", "index.js"]
