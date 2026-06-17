FROM node:20-alpine

# bcrypt needs python3 + make + g++ to compile its native addon
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./

# Install ALL deps (including devDependencies needed for tsc)
# This also compiles native addons (bcrypt) for Linux inside the container
RUN npm ci

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Prune dev deps after build to keep the final image lean
RUN npm prune --omit=dev

EXPOSE 5000

CMD ["node", "dist/index.js"]
