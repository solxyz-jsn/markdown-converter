# Dockerfile for publishing
# ARG VARIANT="14-buster"
FROM node:14.16.1-buster

RUN apt-get update && apt-get install zip

COPY ./ /app
WORKDIR /app

RUN npm ci
RUN npm run build

# Mount point for external applications
VOLUME '/site'

EXPOSE 3000

CMD [ "node", "/app/dist/main.js" ]