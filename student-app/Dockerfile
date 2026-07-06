# ✅ SOLUTION — the "do it right" Dockerfile (see SOLUTION.md for the why).
# This is the MEDIUM / best-practice reference build.

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Dependency layer — cached unless package files change
COPY package*.json ./
RUN npm ci --omit=dev

# App layer
COPY . .

EXPOSE 3000
USER node
CMD ["node", "server.js"]
