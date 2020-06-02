import { createParamDecorator } from '@nestjs/common';
import { Permit } from '@superawesome/permissions';

/* tslint:disable-next-line:variable-name */
export const GetPermit = createParamDecorator(
  (data, req): Permit => {
    if (!req.__permissions_permit__)
      if (req.__permissions_permit__ === false) {
        throw new Error(
          'SA-Permissions-NestJS: @GetPermit() param decorator failed, ' +
            'because you have explicitly decorated your endpoint method with `@PermitGrant(false)`. ' +
            'Hence a real Permit object can NOT be present for endpoint (a dummy can, but in the future).'
        );
      } else {
        throw new Error(
          'SA-Permissions-NestJS: @GetPermit() param decorator failed, because Permit object is not present for endpoint. ' +
            'Did you decorate your controller with `@UseGuards(createPermissionsGuard(...))` ?'
        );
      }

    return req.__permissions_permit__;
  }
);
