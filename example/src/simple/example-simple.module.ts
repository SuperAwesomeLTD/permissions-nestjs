import * as _ from 'lodash';
import { Module } from '@nestjs/common';
import { PermissionsOwnershipService } from '../permissions/permissions-ownership.service';
import {
  PERMISSIONS_OWNERSHIP_SERVICE_TOKEN,
  PermissionsModule,
} from '@superawesome/permissions-nestjs';
import { getUser } from '../permissions/getUser';
import { DocumentUnprotectedController } from '../document-unprotected.controller';
import { DocumentProtectedSimpleController } from './document-protected-simple.controller';

// omitted imports
@Module({
  imports: [
    PermissionsModule.forRoot({
      extractUserFromRequest: async req => getUser(),

      limitOwnReduce: ({ user, limitOwneds }) =>
        _.overSome(limitOwneds.map(limitOwned => limitOwned({ user }))),
      projectResourceId: (resourceIdStr: string | undefined) =>
        Number(resourceIdStr),
    }),
  ],
  controllers: [
    DocumentUnprotectedController,
    DocumentProtectedSimpleController,
  ],
  providers: [
    {
      provide: PERMISSIONS_OWNERSHIP_SERVICE_TOKEN,
      useClass: PermissionsOwnershipService,
    },
  ],
})
export class ExampleSimpleModule {}
