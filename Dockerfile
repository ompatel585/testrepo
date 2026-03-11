# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the build output and essentials
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Optionally copy other runtime files (like migrations, static assets)
# COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
