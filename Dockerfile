FROM node:12.16 AS dev

WORKDIR /srv

ADD package.json ./
ADD package-lock.json ./
RUN npm install

ADD . .

# needed for examples when installing the library into examples
RUN npm run build:ts

# install example deps, which also link ref this library
WORKDIR example
RUN npm install
WORKDIR /srv

### Intermediate

FROM dev AS build
RUN npm run build

### PRODUCTION serve docs as static html ###

FROM nginx:1.15 AS prod
COPY --from=build /srv/dist/docs /usr/share/nginx/html
ADD docker/ /
CMD ["/command.sh"]

EXPOSE 80
