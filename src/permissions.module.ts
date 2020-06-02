import * as _ from 'lodash';
import { Permissions, Tid } from '@superawesome/permissions';
import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import {
  PERMISSIONS_EXTRACT_USER_FROM_REQUEST_TOKEN,
  PERMISSIONS_MAP_RESOURCE_ID_TOKEN,
  PERMISSIONS_TOKEN,
  IPermissionsModuleOptions,
} from './types';
import { PermissionsService } from './permissions.service';
import { defaultExtractUserFromRequest } from './utils';

@Global()
@Module({})
export class PermissionsModule<TUserId extends Tid = number, TResourceId extends Tid = number> {
  public static forRoot({
    permissionDefinitions,
    permissionDefinitionDefaults,
    limitOwnReduce,
    extractUserFromRequest,
    projectResourceId,
  }: IPermissionsModuleOptions = {}): DynamicModule {
    const permissions = new Permissions({
      permissionDefinitions,
      permissionDefinitionDefaults,
      limitOwnReduce,
    });

    const permissionsProvider: Provider = {
      provide: PERMISSIONS_TOKEN,
      useValue: permissions,
    };

    const extractUserFromRequestProvider: Provider = {
      provide: PERMISSIONS_EXTRACT_USER_FROM_REQUEST_TOKEN,
      useValue: extractUserFromRequest || defaultExtractUserFromRequest,
    };

    const mapResourceIdProvider: Provider = {
      provide: PERMISSIONS_MAP_RESOURCE_ID_TOKEN,
      useValue: projectResourceId || _.identity,
    };

    return {
      module: PermissionsModule,
      providers: [
        extractUserFromRequestProvider,
        mapResourceIdProvider,
        permissionsProvider,
        PermissionsService,
      ],
      exports: [extractUserFromRequestProvider, mapResourceIdProvider, permissionsProvider],
    };
  }
}
