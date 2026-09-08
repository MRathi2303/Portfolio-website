FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4173

COPY package.json ./
COPY . .

RUN mkdir -p /app/assets /app/certs \
  && chmod -R 755 /app

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:4173/api/site || exit 1

CMD ["node", "local-server.js"]
