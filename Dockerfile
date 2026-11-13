# syntax=docker/dockerfile:1

# ---------- Frontend build ----------
FROM node:24-alpine AS frontend
WORKDIR /app/frontend
RUN npm install -g pnpm@10
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

# ---------- Backend build ----------
FROM golang:1.27-alpine AS backend
WORKDIR /src
RUN apk add --no-cache git
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/tumata-server ./cmd/server

# ---------- Runtime ----------
FROM alpine:3.22
WORKDIR /app/backend
RUN apk add --no-cache ca-certificates tzdata

COPY --from=backend /out/tumata-server ./tumata-server
COPY start.sh ./start.sh
COPY --from=frontend /app/frontend/dist /app/frontend/dist
COPY assets /app/assets

RUN chmod +x ./tumata-server ./start.sh && mkdir -p /app/backend/uploads/documents

ENV PORT=8080 \
    ASSETS_DIR=/app/assets \
    UPLOAD_DIR=/app/backend/uploads

EXPOSE 8080

CMD ["./tumata-server"]
