FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and backend package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm install --workspace=backend

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

RUN npm run build --workspace=backend

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm install --omit=dev --workspace=backend

COPY --from=builder /app/backend/dist ./backend/dist

USER node

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]
