# Multi-stage Dockerfile for Client (Vite React 19 + TypeScript + Tailwind)

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY . .

# Build production bundle
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Nginx Static Server
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
