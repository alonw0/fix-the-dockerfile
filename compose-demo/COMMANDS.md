# 🐳 Command reference — single container, Compose & volumes

## Single container (the Dockerfile)
```bash
docker build -t guestbook .                       # build image from ./Dockerfile
docker run -p 8000:8000 -v gbdata:/data guestbook # run, publish port, mount a named volume
docker run -d --name gb -p 8000:8000 -v gbdata:/data guestbook   # detached + named
docker logs -f gb                                 # follow its logs
docker stop gb   &&  docker rm gb                 # stop & remove the container
```

## Docker Compose (multi-service)
```bash
docker compose up                 # build (if needed) + start all services, stream logs
docker compose up --build         # force a rebuild of the web image first
docker compose up -d              # start in the background (detached)
docker compose ps                 # list this project's services + status
docker compose logs -f            # follow logs from ALL services
docker compose logs -f web        # ...just the web service
docker compose exec web sh        # shell inside the running web container
docker compose exec db psql -U demo -d guestbook   # open a psql prompt in the DB
docker compose restart web        # restart one service
docker compose stop               # stop services (containers kept)
docker compose down               # stop + REMOVE containers/network — volumes KEPT
docker compose down -v            # ...also delete named volumes (DELETES YOUR DATA)
docker compose config             # show the fully-resolved compose file
```

## Volumes (where the data lives)
```bash
docker volume ls                          # list all volumes
docker volume inspect compose-demo_dbdata # details incl. "Mountpoint" (path on disk)
docker volume inspect gbdata              # the standalone SQLite volume
docker volume rm gbdata                   # delete a specific volume
docker volume prune                       # delete ALL unused volumes (careful!)
```
> Compose prefixes volume names with the project (folder) name, e.g. `compose-demo_dbdata`.

## Peek at the actual data
```bash
# Postgres (Compose): query the tables directly
docker compose exec db psql -U demo -d guestbook -c "select * from messages;"
docker compose exec db psql -U demo -d guestbook -c "select * from stats;"

# SQLite (standalone): the DB file sits inside the volume, in the container at /data
docker exec gb ls -la /data           # see app.db
```

## The persistence demo (do this live)
```bash
docker compose up -d                  # 1. start; add a couple of guestbook messages
docker compose down                   # 2. tear down containers (keep the volume)
docker compose up -d                  # 3. back up — messages are STILL THERE ✅
docker compose down -v                # 4. now delete the volume too
docker compose up -d                  # 5. fresh & empty — the data is gone ❌
```

## Cleanup
```bash
docker compose down -v                # remove this project's containers + volumes
docker image rm guestbook             # remove the standalone image
docker system df                      # how much disk images/containers/volumes use
```
