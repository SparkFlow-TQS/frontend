FROM node:22-alpine

# Create app user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Set working directory and adjust permissions BEFORE switching users
WORKDIR /app
RUN chown -R nextjs:nodejs /app

# Copy package files first
COPY package*.json ./

# Install as root (simpler and cleaner, since image is short-lived)
RUN npm install

# Copy rest of app
COPY . .

# Set ownership to non-root user for runtime
RUN chown -R nextjs:nodejs /app

# Switch to app user
USER nextjs

EXPOSE 3000
CMD ["npm", "run", "dev"]

