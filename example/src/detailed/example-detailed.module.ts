import * as _ from 'lodash';
import { Module } from '@nestjs/common';
import { PermissionsOwnershipService } from '../permissions/permissions-ownership.service';
import {
  PERMISSIONS_OWNERSHIP_SERVICE_TOKEN,
  PermissionsModule,
} from '@superawesome/permissions-nestjs';
import { getUser } from '../permissions/getUser';
import { DocumentUnprotectedController } from '../document-unprotected.controller';
import { DocumentProtectedDetailedController } from './document-protected-detailed.controller';

@Module({
  imports: [
    /**
     Use PermissionsModule.forRoot() to configure Permissions for your module.
     */
    PermissionsModule.forRoot({
      /**
       If your req.user object doesnt already comply with [SuperAwesome Permissions IUser](https://permissions.docs.superawesome.com/interfaces/IUser.html),
       here you can extract and transform it (Optional).

       @param req an expressjs request object
       */
      extractUserFromRequest: async req => getUser(),

      /**
       * Here you can override the default reducer for the [limitOwn](https://permissions.docs.superawesome.com/classes/Permit.html#limitOwn) (Optional).
       *
       * @param user: IUser the request user passed at runtime
       *
       * @param limitOwneds: TlimitOwned[] an array all the `limitOwn` ownership hooks for the particular user
       */
      limitOwnReduce: ({ user, limitOwneds }) =>
        _.overSome(limitOwneds.map(limitOwned => limitOwned({ user }))),

      /**
       Project (i.e map) a `resourceId` on your QueryParams from string (by default the param named "id"),
       to what is needed by the ownership hooks (eg a `number`) for the whole module (Optional).

       __Notes__ :

       - It should be able to tolerate if `resourceId` is missing or null etc and not throw.

       - We can override this `projectResourceId` at the Controller's Guard level at `createPermissionsGuard()`

       - We can also override all at `@PermitGrant()` level only a specific endpoint (even more rare).
       */
      projectResourceId: (resourceIdStr: string | void) =>
        Number(resourceIdStr),
    }),
  ],
  controllers: [
    DocumentUnprotectedController,
    DocumentProtectedDetailedController,
  ],
  providers: [
    /**
     Using the special PERMISSIONS_OWNERSHIP_SERVICE_TOKEN, we must provide our
     `PermissionsOwnershipService` class where our ownership hook methods live.

     See `PermissionsOwnershipService` below on how this looks.
     */
    {
      provide: PERMISSIONS_OWNERSHIP_SERVICE_TOKEN,
      useClass: PermissionsOwnershipService,
    },
  ],
})
export class ExampleDetailedModule {}
