# 🐳 Docker Cheat Sheet — one page for the lesson

## The two commands you need today
```bash
docker build -t docker-game .                                  # build image from ./Dockerfile
docker run -p 3000:3000 -e LEADERBOARD_URL=<url> docker-game    # run it, publish port, pass env
```
Then open **http://localhost:3000**. Stop it with **Ctrl-C** (or `docker stop <name>`).

---

## Dockerfile instructions (what goes IN the Dockerfile)
| Instruction | What it does | Example |
|-------------|--------------|---------|
| `FROM`   | base image to build on (pin the version!) | `FROM node:20-alpine` |
| `WORKDIR`| set/create the working directory | `WORKDIR /app` |
| `COPY`   | copy files from your machine into the image | `COPY package*.json ./` |
| `RUN`    | run a command at **build** time (makes a layer) | `RUN npm ci` |
| `ENV`    | set an environment variable | `ENV NODE_ENV=production` |
| `EXPOSE` | document the port the app listens on | `EXPOSE 3000` |
| `USER`   | drop from root to a normal user | `USER node` |
| `CMD`    | the command that runs when the container **starts** | `CMD ["node","server.js"]` |

> 🧠 `RUN` = build time. `CMD` = start time. `EXPOSE` documents a port; `-p` actually publishes it.

---

## docker build / run flags
| Flag | Meaning |
|------|---------|
| `-t name`        | tag (name) the image |
| `.`              | build context = current folder (where the Dockerfile is) |
| `-p HOST:CONT`   | publish container port to your machine, e.g. `-p 3000:3000` |
| `-e KEY=value`   | pass an environment variable in at runtime |
| `-d`             | run detached (in the background) |
| `--name mybox`   | give the container a friendly name |
| `--rm`           | auto-delete the container when it stops |

---

## Inspect & debug
```bash
docker ps                 # running containers
docker ps -a              # ALL containers (incl. crashed ones)
docker logs <name>        # see a container's output  ← use when it exits immediately!
docker images             # list images + sizes (compare node vs node:20-alpine)
docker history <image>    # see the layers (great for the caching lesson)
docker exec -it <name> sh # open a shell INSIDE a running container
```

## Clean up
```bash
docker stop <name>        # stop a running container
docker rm <name>          # remove a stopped container
docker rmi <image>        # remove an image
docker system prune       # remove all unused stuff (careful!)
```

---

## Layer caching (the MEDIUM "aha")
```dockerfile
COPY package*.json ./     # copy manifests FIRST
RUN npm ci                # this layer is CACHED unless deps change
COPY . .                  # code changes only invalidate from here down
```
Change a file in `public/`, rebuild, and watch the `npm ci` step say **CACHED**. ⚡

## `.dockerignore` (next to the Dockerfile)
```
node_modules
npm-debug.log
.git
Dockerfile
*.md
```
Keeps junk out of the build context → smaller, faster, safer images.

---

## Stuck? quick triage
- **Build error** → read the **first** error line; it names the failing step.
- **Page won't load** → did you add `-p 3000:3000`?
- **"No leaderboard server configured"** → you forgot `-e LEADERBOARD_URL=...`.
- **Container exits instantly** → run `docker logs <name>`; usually a wrong `CMD` or missing deps.
