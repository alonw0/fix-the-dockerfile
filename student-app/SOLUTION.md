# ✅ Instructor Solution — the fixed Dockerfile

> Keep this away from students until they've had a real go. 🙂

**Two starter files ship in `student-app/`:**
- **`Dockerfile`** (default) — harder: bare and broken, minimal comments. Students infer the fixes.
- **`Dockerfile-hints`** — friendlier: every fix flagged with `❌` + `# TODO`. Fallback for
  strugglers via `docker build -f Dockerfile-hints -t docker-game .`

Both need the **same** fixes below.

## EASY — minimal working Dockerfile

```dockerfile
FROM node:20-alpine          # Bug 1: pinned + small base image
WORKDIR /app                 # Bug 2: a real working directory
COPY package*.json ./        # Bug 3: copy manifests first (cache-friendly)
RUN npm install              # Bug 4: install dependencies
COPY . .                     # copy the rest of the source AFTER install
EXPOSE 3000                  # Bug 5: declare the port
CMD ["node", "server.js"]    # Bug 6: the real entry file
```

Build & run:
```bash
docker build -t docker-game .
docker run -p 3000:3000 -e LEADERBOARD_URL=https://<your-app>.vercel.app docker-game
```

### Why each fix matters
| Bug | Fix | Why |
|-----|-----|-----|
| 1 | `node:20-alpine` | `node` = `node:latest`: huge, unpinned, non-reproducible. Alpine is ~5× smaller. |
| 2 | `WORKDIR /app` | Gives commands a stable directory; avoids writing to `/`. |
| 3 | copy manifests first | Lets Docker cache `npm install` unless deps actually change. |
| 4 | `RUN npm install` | Without it, `require("express")` throws `MODULE_NOT_FOUND`. |
| 5 | `EXPOSE 3000` | Documents the port; pairs with `-p 3000:3000` at runtime. |
| 6 | `CMD ["node","server.js"]` | `index.js` doesn't exist → container exits immediately. |

> Note: `EXPOSE` alone does **not** publish the port — you still need `-p 3000:3000` on
> `docker run`. Great teaching moment: EXPOSE is documentation; `-p` is what actually maps it.

---

## MEDIUM — the "right way" Dockerfile

```dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Dependency layer — cached unless package files change
COPY package*.json ./
RUN npm ci --omit=dev

# App layer
COPY . .

EXPOSE 3000
USER node                    # don't run as root
CMD ["node", "server.js"]
```

And add **`.dockerignore`** (this file is intentionally missing from the starter):
```
node_modules
npm-debug.log
.git
Dockerfile*
*.md
```

### Talking points
- **Layer caching:** editing `public/app.js` and rebuilding should show `CACHED` on the
  `npm ci` step. Demo the before/after rebuild time — this is the "aha" moment.
- **Image size:** `docker images` — compare `node` vs `node:20-alpine` builds (~1GB → ~150MB).
- **`npm ci` vs `npm install`:** `ci` is reproducible from the lockfile and fails if it drifts.
- **Non-root:** `USER node` uses the built-in unprivileged user — a real security practice.
- **`.dockerignore`:** without it, `node_modules` and `.git` get copied into the build
  context (slow) and can leak into the image. Show `docker build` context size shrink.

> ⚠️ If you demo `npm ci`, the repo must have a `package-lock.json`. Run `npm install` once
> locally in `student-app/` beforehand to generate it (or have students use `npm install` in
> the EASY step, which creates it). For the MEDIUM `npm ci --omit=dev` there are no dev deps
> here anyway, so `npm ci` is fine.
