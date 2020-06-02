/*
Note: This file doesn't have normal tests!

It is only for documentation purposes, generating docs by including code files & running some e2e tests to prove our examples actually work.

See example/src/__tests__/normal.documents.controller.e2e-spec.ts
*/
import * as upath from 'upath';

import {
  docs,
  joinAll,
  DO_NOT_EDIT_NOTICE,
  noJestRunner,
  fileToText,
} from '@superawesome/permissions/dist/__tests__/utils/test.utils';

noJestRunner();

let injectedUser = null;
jest.mock('../permissions/getUser', () => ({ getUser: () => injectedUser }));

describe(
  DO_NOT_EDIT_NOTICE(upath.relative(__dirname, __filename)) +
    '\n' +
    joinAll(
      docs(`
# NestJS with SuperAwesome Permissions - Reference & Detailed example

## Detailed Documents Protected Controller Example

Lets now see a slightly more complicated example, based on the [previous simple example](/additional-documentation/how-to-use-simple-example.html).

This example is also acting as a reference, using inline comments. Hence, it has to list every single parameter and option, which most times you will not need to touch.
`),

      fileToText(
        __dirname,
        '../detailed/document-protected-detailed.controller.ts',
        '// omitted imports',
        { printWidth: 80, parser: 'typescript' },
      ),
    ),
  () => {
    it(
      joinAll(
        docs(
          `
# Setting up the NestJS module

The NestJS module is very simple.
`,
        ),
        fileToText(__dirname, `../detailed/example-detailed.module.ts`, '', {
          printWidth: 78,
          parser: 'typescript',
        }),
      ),
      () => {},
    );

    it(
      joinAll(
        docs(
          `
# The PermissionsOwnershipService

You will need an @Injectable (a.k.a a Service) that holds all the ownership hooks as methods, provided via the special \`PERMISSIONS_OWNERSHIP_SERVICE_TOKEN\` in your module (see above).

In this simple example we don't have any dependencies to inject, but in the real world in this Service you inject you DB repos and any other services you'll need to lookup the actual ownerships of your current user, against the resources they are trying to access.

__Note:__ If a method name declared in the special PermissionsDefinitions variant [IPermissionDefinitionStringOwnHooks](/interfaces/IPermissionDefinitionStringOwnHooks.html) is missing from this \`PermissionsOwnershipService\`, you'll get an exception at the module build time.
`,
        ),
        fileToText(
          __dirname,
          `../permissions/permissions-ownership.service.ts`,
          '',
          {
            printWidth: 78,
            parser: 'typescript',
          },
        ),
        docs(`
That's it, you have all you need to start using permissions-nestjs!

Happy permitting!
`),
      ),
      () => {},
    );
  },
);
