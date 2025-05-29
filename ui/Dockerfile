FROM node:22-alpine

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "dev"]