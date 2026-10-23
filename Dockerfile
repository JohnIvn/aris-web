# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (dev included for build)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy project files
COPY vite.config.js ./
COPY jsconfig.json ./
COPY index.html ./
COPY src ./src
COPY public ./public

# Build arguments for Railway variables (public backend URL for browser)
ARG VITE_API_URL=https://nutribin-user-backend-production.up.railway.app
ARG VITE_GOOGLE_CLIENT_ID

# Build the React/Vite app to ./dist
RUN VITE_API_URL=${VITE_API_URL} VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose the port Railway expects (it will set PORT env)
EXPOSE 8080

# Serve the static files on the PORT provided by the environment (default 8080)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
