#!/bin/bash -ex

docker-compose build

# Ensure that the build before the npm release will work
docker-compose run --no-dep project npm run build
