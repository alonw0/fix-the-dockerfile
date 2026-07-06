# A small, sensible Python image built on a SLIM base.
FROM python:3.12-slim

# Cleaner Python inside containers: no .pyc files, unbuffered logs.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install deps first so this layer is cached until requirements.txt changes.
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then the app code.
COPY app/ .

# /data is where the SQLite file lives when running standalone.
# Declaring it as a VOLUME means Docker persists it even without an explicit -v.
VOLUME ["/data"]

EXPOSE 8000
CMD ["python", "main.py"]
