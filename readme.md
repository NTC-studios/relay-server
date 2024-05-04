# The Invisible Board Game - Relay Server

This repository holds the code for a relay server between clients for The Invisible Board Game.\
We tried using Go first, but ~~failed~~ decided on TypeScript in the end.

Development:

```sh
docker compose build # don't need to do this each time (directory is mounted as volume)
docker compose up
```

Production:

```sh
docker compose -f docker-compose.production.yaml build
docker compose -f docker-compose.production.yaml up
```
