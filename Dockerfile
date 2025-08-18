# Dockerfile for publishing
# ARG VARIANT="14-buster"
FROM node:22-trixie-slim

RUN apt-get update && apt-get install -y zip

COPY ./ /app
WORKDIR /app

RUN npm ci
RUN npm run build

# Mount point for external applications
VOLUME '/site'

EXPOSE 3000

CMD [ "node", "/app/dist/main.js" ]
