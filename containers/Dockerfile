FROM node:22-alpine

WORKDIR /usr/src/app

# Can't remember if this is actually needed when using docker-compose
EXPOSE 8080

# the directory is mounted as a volume (in docker-compose.yaml) so it can update live
CMD sh -c "npm run dev:watch & npm run dev:start"


