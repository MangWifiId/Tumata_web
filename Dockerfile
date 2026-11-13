# syntax=docker/dockerfile:1

# ---------- Backend build ----------
# The React app is built locally and committed in frontend/dist, so the Docker
# build only compiles Go. This keeps the build fast and the exported image small.
FROM golang:1.27-alpine AS backend
WORKDIR /src
RUN apk add --no-cache ca-certificates
COPY backend/go.mod backend/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY backend/ ./
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/tumata-server ./cmd/server

# ---------- Runtime ----------
FROM alpine:3.22
WORKDIR /app/backend
RUN apk add --no-cache ca-certificates tzdata

COPY --from=backend /out/tumata-server ./tumata-server
COPY start.sh ./start.sh
COPY frontend/dist /app/frontend/dist
COPY assets /app/assets

RUN chmod +x ./tumata-server ./start.sh && mkdir -p /app/backend/uploads/documents

ENV PORT=8080 \
    ASSETS_DIR=/app/assets \
    UPLOAD_DIR=/app/backend/uploads

EXPOSE 8080

CMD ["./tumata-server"]
