FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 3000

# Wait for API then start Next.js (see docker-compose command)
CMD ["npm", "run", "dev"]
