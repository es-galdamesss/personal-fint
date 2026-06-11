# Base image with Node.js 20 on Alpine Linux
FROM node:20-alpine AS base

# Install pnpm version matching the packageManager field in package.json
RUN npm install -g pnpm@10.0.0

WORKDIR /app

# Step 1: Install dependencies first (leverage Docker caching)
FROM base AS deps
# Copy dependency configuration and workspace manifest
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy prisma schema so we can run dependency scripts and generate the client
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Step 2: Build the Next.js application
FROM base AS builder
# Copy node_modules and files from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy all source files
COPY . .

# Run the build script (which triggers prisma generate and next build)
# Pass dummy DATABASE_URL to prevent Prisma/Next build errors during build-time
ENV DATABASE_URL="postgresql://fintrack_user:fintrack_password@localhost:5432/fintrack_db?schema=public"
RUN pnpm build

# Step 3: Run the Next.js production server
FROM base AS runner
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy all built assets, configurations, and node_modules from builder
COPY --from=builder /app ./

# Expose port 3000
EXPOSE 3000

# Start Next.js server using pnpm start
CMD ["pnpm", "start"]
