# ==============================================================================
# STAGE 1: Build React 19 Frontend using Node.js on Debian Bookworm
# ==============================================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install standard build dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package descriptors and install dependencies
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# ==============================================================================
# STAGE 2: Production Nginx on Debian Bookworm (Same-Origin Reverse Proxy)
# ==============================================================================
FROM nginx:bookworm

LABEL maintainer="SINCOMTT Architecture Team <cantv-ggfpp@cantv.gob.ve>"
LABEL description="SINCOMTT Frontend SPA - React 19 on Debian Bookworm with Nginx Same-Origin"

# Remove default nginx static assets and config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy compiled SPA from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

