# Stage 1: Build frontend
FROM node:18 as builder
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend/ frontend/
COPY frontend/src frontend/src
COPY frontend/index.js frontend/src/index.js
RUN cd frontend && npm run build

# Stage 2: Set up backend and serve
FROM node:18
WORKDIR /app
COPY backend/package*.json backend/
RUN cd backend && npm install
COPY backend/ backend/
COPY config/ config/
COPY --from=builder /app/frontend/build/ frontend/build/

# Run the backend
CMD ["node", "backend/server.js"]
