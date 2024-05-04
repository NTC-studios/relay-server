FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Can't remember if this is actually needed when using docker-compose
EXPOSE 8080

CMD ["npm", "run", "start"]