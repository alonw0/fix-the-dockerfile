# 👩‍🏫 Instructor Guide

## 0. Before class — deploy the leaderboard (5 min, do once)

The leaderboard is a small Vercel app with an Upstash Redis (KV) store.

### A. Deploy
```bash
cd leaderboard-server
npm install
npx vercel            # first run: log in + link/create a project (accept defaults)
```
Or push this repo to GitHub and **Import Project** at https://vercel.com/new.

### B. Add the KV / Redis store (this is what stores players + votes)
1. Vercel dashboard → your project → **Storage** tab → **Create Database**.
2. Choose **Upstash for Redis** (marketplace) — free tier is plenty.
3. **Connect** it to this project. Vercel auto-injects the credentials as env vars
   (`KV_REST_API_URL` / `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` / `..._TOKEN` —
   the code accepts either).
4. **Redeploy** so the functions pick up the new env vars:
   ```bash
   npx vercel --prod
   ```

### C. Grab your URLs
- **Projector board:** `https://<your-project>.vercel.app`  → open this on the big screen.
- **The URL you hand to students** is the same base URL. They pass it as
  `-e LEADERBOARD_URL=https://<your-project>.vercel.app`.

### D. Smoke test
```bash
BASE=https://<your-project>.vercel.app
curl -s -X POST $BASE/api/entries -H 'content-type: application/json' \
  -d '{"name":"Test Whale","gifUrl":"https://media.giphy.com/media/3o7TKsQ8U0YQ0y3l0Y/giphy.gif"}'
curl -s $BASE/api/entries
```
You should see the entry back, and it should appear on the projector page within ~3s.
(To clear test data before class: delete keys in the Upstash console, or just leave it —
students will bury it.)

---

## 1. During class

1. Open the projector board on the big screen.
2. Give students this repo + the one line they need:
   > `docker run -p 3000:3000 -e LEADERBOARD_URL=https://<your-project>.vercel.app docker-game`
   (after they `docker build -t docker-game .`)
3. Point them at `student-app/CHALLENGES.md`. Let them work the **EASY** 6 bugs.
4. As fixes land, GIFs pop onto the projector — great energy moment. 🎉
5. Then run the **MEDIUM** section together (caching, `.dockerignore`, alpine, non-root).
   Demo the rebuild-speed and image-size wins live — that's the memorable part.
6. Open voting: everyone upvotes favourites; the board reshuffles live.

## 2. Teaching beats worth calling out
- **`EXPOSE` vs `-p`** — EXPOSE documents, `-p` actually publishes. Classic confusion.
- **`-e LEADERBOARD_URL`** — same image, different config at runtime, no rebuild.
- **Layer caching** — reorder COPY/RUN, change a file, watch `CACHED`. The "aha".
- **Image size** — `docker images` before/after alpine.
- **Non-root** — `USER node` — security in one line.

## 3. Answer key
It's on the **`solution` branch** (`git checkout solution`): the fully fixed `Dockerfile`,
a `.dockerignore`, and `student-app/SOLUTION.md` explaining why each fix matters.
The **`hints` branch** has a middle-ground Dockerfile with a `# TODO` on every fix for
students who get stuck — point them there before revealing the solution.

## 4. Cost / cleanup
- Vercel Hobby + Upstash free tier = $0 for a class.
- Nothing to tear down; delete the Vercel project + Upstash DB afterward if you like.
