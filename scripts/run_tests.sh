#!/bin/bash -ex

# docker-compose build

# note: the name `project` is by convention, comes from the service name in docker-compose.yml
docker-compose run project npm test
