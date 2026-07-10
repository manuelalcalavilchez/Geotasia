# --- Base Stage ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Development Stage ---
# This stage is optimized for local development with live-reloading.
# You can mount your project directory into the container to see immediate changes.
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- Builder Stage ---
# This stage builds the frontend assets for production.
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# --- Production Runner Stage ---
# This stage creates the slim, secure production container.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules from builder to avoid reinstall issues
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy built assets and the custom Express server from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose port 3000 for Easypanel, Cloud Run, or custom ingress
EXPOSE 3000

# Start the web server
CMD ["node", "server.js"]
