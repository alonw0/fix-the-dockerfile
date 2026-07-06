"""
Tiny guestbook — the app we use to explain Docker Compose & volumes.

It runs against whatever DATABASE_URL points to:
  • no DATABASE_URL  →  SQLite file at /data/app.db   (standalone `docker run`)
  • DATABASE_URL set →  PostgreSQL                     (`docker compose up`)

Same code, two backends — the ONLY difference is one environment variable and
where the data volume is mounted. That's the whole lesson.
"""
import os
import time
from datetime import datetime, timezone

from flask import Flask, request, redirect, render_template
from sqlalchemy import create_engine, select, String, Integer, Text, DateTime
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

# SQLite fallback keeps the standalone container self-contained (no DB needed).
DB_URL = os.environ.get("DATABASE_URL", "sqlite:////data/app.db")
url = make_url(DB_URL)

# For SQLite, make sure the folder (the volume mount point) exists.
if url.drivername.startswith("sqlite") and url.database:
    os.makedirs(os.path.dirname(url.database) or ".", exist_ok=True)

engine = create_engine(DB_URL, future=True)


class Base(DeclarativeBase):
    pass


class Stat(Base):
    __tablename__ = "stats"
    key: Mapped[str] = mapped_column(String(50), primary_key=True)
    value: Mapped[int] = mapped_column(Integer, default=0)


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(60))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


def init_db(retries: int = 15, delay: float = 1.5) -> None:
    """Create tables — retrying, because in Compose the DB may still be booting."""
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(engine)
            print(f"✅ Connected to {url.drivername} and ensured tables exist.")
            return
        except OperationalError as exc:
            print(f"⏳ DB not ready ({attempt}/{retries}): {exc.orig}")
            time.sleep(delay)
    raise SystemExit("❌ Database never became reachable — giving up.")


app = Flask(__name__)


@app.route("/")
def index():
    with Session(engine) as s:
        stat = s.get(Stat, "visits")
        if stat is None:
            stat = Stat(key="visits", value=0)
            s.add(stat)
        stat.value += 1
        s.commit()
        visits = stat.value
        messages = s.execute(
            select(Message).order_by(Message.id.desc()).limit(10)
        ).scalars().all()

    backend = "PostgreSQL" if url.drivername.startswith("postgresql") else "SQLite"
    return render_template(
        "index.html",
        visits=visits,
        messages=messages,
        backend=backend,
        db_display=url.render_as_string(hide_password=True),
        hostname=os.environ.get("HOSTNAME", "?"),
    )


@app.route("/message", methods=["POST"])
def add_message():
    name = (request.form.get("name") or "anon").strip()[:60] or "anon"
    body = (request.form.get("body") or "").strip()[:500]
    if body:
        with Session(engine) as s:
            s.add(Message(name=name, body=body, created_at=datetime.now(timezone.utc)))
            s.commit()
    return redirect("/")


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=8000)
