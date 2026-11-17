# Лише один сервіс: Task Tracker (API + статичний вебінтерфейс)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
COPY scripts ./scripts
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "dist/src/server.mjs"]
