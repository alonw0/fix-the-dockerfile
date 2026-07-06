# 🐳 Docker Challenge — Fix the Dockerfile

Your mission: get this app running inside a container. When it works, open
http://localhost:3000, submit your name + a GIF, and you'll appear on the class
leaderboard on the big screen.

You'll only edit **one file: `Dockerfile`**. (And later add one new file, `.dockerignore`.)

---

## 🟢 EASY — Make it build & run

The `Dockerfile` has **6 bugs**, each marked with `❌` and a `# TODO`. Fix them so this works:

```bash
# from inside the student-app/ folder:
docker build -t docker-game .
docker run -p 3000:3000 -e LEADERBOARD_URL=<url-from-your-instructor> docker-game
```

Then open **http://localhost:3000**.

The starter `Dockerfile` is intentionally bare — it's missing steps a Node app needs and
gets a couple of things wrong. Work out what's broken yourself. There are **6 things** to fix:

1. **Unpinned base image** — `FROM node` grabs an unpredictable, giant "latest". Pin a small one.
2. **No `WORKDIR`** — the container has nowhere defined to put your app.
3. **Copy-before-install ordering** — copying everything first wastes Docker's cache.
4. **Dependencies never installed** — there's no `npm install`, so Express is missing.
5. **No `EXPOSE`** — the image never declares the port the app listens on.
6. **Wrong `CMD`** — it points at a file that doesn't exist.

> 🆘 **Too tricky?** The **`hints` branch** has the same `Dockerfile` with a `# TODO`
> on every fix:
> ```bash
> git checkout hints
> ```
> The **`solution` branch** has the full answer once you've given it a real go.

### Two things to notice about `docker run`
- `-p 3000:3000` **publishes the port** — without it, the app runs but you can't reach it.
- `-e LEADERBOARD_URL=...` **passes an environment variable** in at runtime — that's how the
  app knows which shared leaderboard to talk to. (No rebuild needed to change it!)

✅ **Done when:** the build is green, the container logs `🐳 Docker Game running…`, and the
form loads at http://localhost:3000. Submit yourself — you should land on the leaderboard.

---

## 🟡 MEDIUM — Do it the *right* way

It runs now, but a good Dockerfile is small, fast to rebuild, and secure. Improve it:

1. **Pin & shrink the base image**
   Use `node:20-alpine` instead of `node`. Compare sizes: `docker images` — alpine is ~10x smaller.

2. **Order layers for caching**
   ```dockerfile
   COPY package*.json ./
   RUN npm ci
   COPY . .
   ```
   Now editing `server.js` reuses the cached `npm ci` layer — rebuilds go from ~30s to ~1s.
   Try it: change a file in `public/`, rebuild, and watch the install step say `CACHED`.

3. **Add a `.dockerignore`**
   Create a file called `.dockerignore` next to the Dockerfile:
   ```
   node_modules
   npm-debug.log
   .git
   Dockerfile
   *.md
   ```
   This keeps junk out of the build context → smaller, faster, more reproducible builds.

4. **Use `npm ci` + production mode**
   `npm ci` installs exactly what's in the lockfile (reproducible). Add `ENV NODE_ENV=production`.

5. **🔒 Stretch: run as a non-root user**
   The official node image ships a `node` user. Add `USER node` before the `CMD` so the app
   doesn't run as root inside the container.

✅ **Done when:** the image is smaller (`docker images`), a code-only change rebuilds almost
instantly, and `docker history docker-game` shows a clean, cache-friendly layer order.

---

## Stuck?
- `docker build` errors → read the FIRST error line; it names the failing step.
- Container starts but page won't load → did you pass `-p 3000:3000`?
- "No leaderboard server configured" on the page → you forgot `-e LEADERBOARD_URL=...`.
- Container exits immediately → the `CMD` is wrong (Bug 6), or deps aren't installed (Bug 4).

Ask your instructor for the solution once you've given it a real try. 💪
