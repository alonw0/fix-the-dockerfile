# 🐳 Docker Game — Fix the Dockerfile, Join the Leaderboard

A hands-on way to learn Dockerfiles. You get an app with a **broken Dockerfile**.
Fix it, run the container, and a web form pops up where you submit your **name + a GIF**.
You instantly land on a **live leaderboard** projected in the room — then everyone battles
for **upvotes**. 🏆

```
┌─────────────────────┐         ┌──────────────────────────┐
│  Your container      │  POST   │  Leaderboard server       │
│  (you fix its        │ ──────▶ │  (on Vercel, shared by    │
│   Dockerfile)        │         │   the whole class)        │
│  localhost:3000      │ ◀────── │  projected on the screen  │
└─────────────────────┘  entries └──────────────────────────┘
```

## For students — start here 👇

Everything you need is in **[`student-app/`](./student-app/)**:

1. Read **[`student-app/CHALLENGES.md`](./student-app/CHALLENGES.md)**.
2. Fix the 6 bugs in **`student-app/Dockerfile`**.
3. Build & run:
   ```bash
   cd student-app
   docker build -t docker-game .
   docker run -p 3000:3000 -e LEADERBOARD_URL=<url-from-instructor> docker-game
   ```
4. Open **http://localhost:3000**, submit yourself, and watch the big screen. 🎉
5. Then do the **MEDIUM** tasks to make your Dockerfile fast, small, and secure.

You only need **Docker installed** — no Node.js required on your machine. That's the point!

## For the instructor

See **[`INSTRUCTOR.md`](./INSTRUCTOR.md)** — how to deploy the leaderboard to Vercel,
hand out the URL, and run the session.

## Branches — pick your difficulty
| Branch | What you get |
|--------|--------------|
| **`main`** | The challenge on hard mode — a bare, broken `Dockerfile`. Start here. |
| **`hints`** | The same `Dockerfile` with a `# TODO` on every fix. `git checkout hints` if you're stuck. |
| **`solution`** | The fully fixed `Dockerfile` + `.dockerignore` + `SOLUTION.md` explaining every fix (instructors / after you've tried). |

```bash
git checkout hints      # gentler version with hints
git checkout solution   # the answer + full explanation
git checkout main       # back to the challenge
```

## Repo layout
```
docker-lesson/
├── student-app/         ← the challenge (students fix the Dockerfile here)
└── leaderboard-server/  ← you deploy this to Vercel once, before class
```
