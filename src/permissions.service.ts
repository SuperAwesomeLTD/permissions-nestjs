import { Permissions } from '@superawesome/permissions';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectPermissions } from './inject-permissions.decorator';

/**
 * @internal class - you dont need to touch it / use it.
 */
@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(@InjectPermissions() private permissions: Permissions) {}

  onModuleInit() {
    this.permissions.build();
  }
}
