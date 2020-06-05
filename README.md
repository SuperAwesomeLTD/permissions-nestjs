# SuperAwesome Permissions NestJS

- npm package at `@superawesome/permissions-nestjs`

## Contents


The actual generated docs are at `npm run docs:serve` and **coming soon** at [**SuperAwesome Permissions for NestJS Documentation**](https://permissions-nestjs.docs.superawesome.com). Go to the left, at the CompoDocs Nav Bar.

**NOTE: THESE LINKS BREAK ON GITHUB! (^^^ read above ^^^)**

- [Introduction](/additional-documentation/introduction.html)

- [How to use & Simple Example](/additional-documentation/how-to-use-simple-example.html). 

- [Detailed Example & Reference](/additional-documentation/reference-&-detailed-example.html).

**Note**: This is the underlying [SuperAwesome Permissions](https://github.com/SuperAwesomeLTD/permissions) library.

# Versioning

The project follows [semantic versioning](https://semver.org/) which effectivelly means a new major version x.0.0 is released when there are breaking changes, minor 0.x.0 when there are new features and patch 0.0.x when there are fixes. 

# How to develop

__IMPORTANT__: do `npm install && npm run install-example` on project root before using!  

## Code

- Simply do an `npm run test:watch` to develop and test at each change.

- With `npm run dev` you watch files building library at `/dist`.

- With `npm run build:ts` you get a build of the library at `/dist`.

- With `npm run build` you get a full build of library & docs at `/dist`.

## Documentation

End user docs reside at `src/docs`:

- With `npm run docs:build` it builds docs at `dist/docs` once.

- With `npm run docs:serve` it serves docs at http://127.0.0.1:8091 in non-watch mode.

- With `npm run docs:watch` it serves docs at http://127.0.0.1:8091 in watch mode.
