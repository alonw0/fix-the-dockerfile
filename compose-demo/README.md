# 🐳 Compose Demo — one app, two ways to run it

A tiny **Python (Flask) guestbook** that counts page views and stores messages in a
database. We use it to teach three things, in order:

1. **A single container** (`docker run`) — with a **volume** so data survives restarts.
2. **Docker Compose** (`docker compose up`) — the app **+ a Postgres database** as two
   services wired together.
3. **Volumes** — *where the data actually lives*, and what deletes it.

The clever bit: **the same code** runs on either backend. It reads one environment
variable, `DATABASE_URL`:

| How you run it | `DATABASE_URL` | Database | Data lives in |
|----------------|----------------|----------|----------------|
| `docker run` (standalone) | *(unset)* | **SQLite** file `/data/app.db` | a volume mounted at `/data` |
| `docker compose up` | `postgresql+psycopg://…@db/…` | **PostgreSQL** service | named volume `dbdata` |

So "adding a database with Compose" is literally: start a second service and set one env var.

---

## 1. Standalone — a single container + a volume
```bash
docker build -t guestbook .

# named volume "gbdata" mounted at /data → the SQLite file persists there
docker run -p 8000:8000 -v gbdata:/data --name guestbook guestbook
```
Open **http://localhost:8000**, refresh a few times, sign the guestbook.

**Prove the volume works:** stop & delete the *container*, run a fresh one on the *same
volume* — your count and messages are still there, because they live in the volume, not
the container:
```bash
docker rm -f guestbook
docker run -p 8000:8000 -v gbdata:/data --name guestbook guestbook   # data survived 🎉
```

---

## 2. Compose — app + Postgres, together
```bash
docker compose up --build        # add -d to run in the background
```
Open **http://localhost:8000** — the badge now says **PostgreSQL**. The app talks to the
database over Compose's private network, reaching it by the service name **`db`** (no IP
addresses, no `--link`).

Handy while it's running:
```bash
docker compose ps                # what's up
docker compose logs -f web       # follow the app logs
docker compose exec db psql -U demo -d guestbook -c "select * from messages;"
```

---

## 3. Volumes — where does the data go?
```bash
docker volume ls                             # see gbdata and compose-demo_dbdata
docker volume inspect compose-demo_dbdata    # Mountpoint = where Docker stores it on disk
```

The difference that trips everyone up:
```bash
docker compose down       # stops & removes containers — VOLUME (data) is KEPT
docker compose up         # ...come back and your messages are still here

docker compose down -v    # the -v ALSO deletes the volume — data is GONE
```

> 🧠 **Containers are disposable; volumes are where state lives.** Delete a container and
> nothing is lost. Delete the volume (`-v`) and the data is gone for good.

See **[`COMMANDS.md`](./COMMANDS.md)** for the full command reference.
