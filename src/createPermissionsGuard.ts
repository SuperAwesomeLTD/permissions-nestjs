import * as _ from 'lodash'; // remove lodash - see https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  Permit,
  GrantPermitQuery,
  PermissionDefinition,
  PermissionDefinitionDefaults,
  Permissions,
  Tid,
} from '@superawesome/permissions';
import { InjectPermissions } from './inject-permissions.decorator';
import {
  PERMISSIONS_EXTRACT_USER_FROM_REQUEST_TOKEN,
  PERMISSIONS_OWNERSHIP_SERVICE_TOKEN,
  PERMISSIONS_MAP_RESOURCE_ID_TOKEN,
  TExtractUserFromRequest,
  IPermissionDefinitionStringOwnHooks,
  TProjectTo,
} from './types';
import { PermitGrantArgs } from './PermitGrant.decorator';
import { nameAClass, randomString } from './utils';

/**
 * Acts only as an interface
 * @internal
 */
export abstract class AbstractPermissionsGuard implements CanActivate {
  constructor(
    // dummy, used only as interface
    protected readonly permissions: Permissions<Tid, Tid>,
    protected readonly permissionsOwnershipService: any,
    protected reflector: Reflector,
    protected readonly extractUserFromRequest: TExtractUserFromRequest<Tid>
  ) {}

  abstract async canActivate(context: ExecutionContext);
}

export interface IGuardOptions<TResourceId extends Tid = number> {
  resource?: string;
  projectResourceId?: TProjectTo<TResourceId>;
}

/**
 * The factory function that creates the customised Guard for a Controller.
 *
 * @param guardOptions see IGuardOptions
 * @param permissionDefinitionStringOwnHooks
 * @param pdDefaults
 */
export const createPermissionsGuard = (
  guardOptions: IGuardOptions = {},
  permissionDefinitionStringOwnHooks?:
    | IPermissionDefinitionStringOwnHooks
    | IPermissionDefinitionStringOwnHooks[],
  pdDefaults: PermissionDefinitionDefaults = {}
): typeof AbstractPermissionsGuard => {
  @Injectable()
  class ConcretePermissionsGuard extends AbstractPermissionsGuard {
    constructor(
      @InjectPermissions() protected readonly permissions: Permissions<Tid, Tid>,
      @Inject(PERMISSIONS_OWNERSHIP_SERVICE_TOKEN)
      protected readonly permissionsOwnershipService: any,
      protected reflector: Reflector,
      @Inject(PERMISSIONS_EXTRACT_USER_FROM_REQUEST_TOKEN)
      protected readonly extractUserFromRequest: TExtractUserFromRequest<Tid>,
      @Inject(PERMISSIONS_MAP_RESOURCE_ID_TOKEN)
      protected readonly defaultProjectResourceId: TProjectTo
    ) {
      super(permissions, permissionsOwnershipService, reflector, extractUserFromRequest);

      // Replace owner hooks string method names of PermissionDefinitionStringOwnHooks with the real ones from the service
      // @todo: make type-safe injectable if there's a way to pass references
      //        of the decorated service / controller in decorators
      // see:
      //  https://stackoverflow.com/questions/52106406/in-nest-js-how-to-get-a-service-instance-inside-a-decorator
      //  https://stackoverflow.com/questions/55560858/in-nest-js-is-it-possible-to-get-service-instance-inside-a-param-decorator
      //  https://stackoverflow.com/questions/52862644/inject-service-into-guard-in-nest-js
      //  https://stackoverflow.com/questions/49160973/nest-js-unable-to-inject-service-into-guard-if-used-in-module
      //  https://github.com/nestjs/nest/issues/2130
      //  https://github.com/nestjs/nest/issues/1916
      //  https://github.com/nestjs/nest/issues/1038
      //  https://stackoverflow.com/questions/55325182/nest-cant-resolve-dependencies-of-guard-wrapped-inside-a-decorator
      if (!this.permissions.isBuilt && permissionDefinitionStringOwnHooks) {
        if (!_.isArray(permissionDefinitionStringOwnHooks))
          permissionDefinitionStringOwnHooks = [permissionDefinitionStringOwnHooks];

        const hookNames = ['isOwner', 'listOwned', 'limitOwned'];
        const permissionDefinitions: PermissionDefinition[] = permissionDefinitionStringOwnHooks.map(
          pdStringOwnHooks => {
            const realPD: PermissionDefinition = _.omit(pdStringOwnHooks, hookNames) as any; // only static array works without any;-)

            _.each(hookNames, hookName => {
              if (_.isString(pdStringOwnHooks[hookName])) {
                if (!_.isFunction(this.permissionsOwnershipService[pdStringOwnHooks[hookName]]))
                  throw new HttpException(
                    `SA-Permissions NestJS: missing service method for "${hookName}" \`${pdStringOwnHooks[hookName]}\``,
                    HttpStatus.INTERNAL_SERVER_ERROR
                  );

                realPD[hookName] = this.permissionsOwnershipService[
                  pdStringOwnHooks[hookName]
                ].bind(permissionsOwnershipService);
              }
            });

            return realPD;
          }
        );

        this.permissions.addDefinitions(permissionDefinitions, pdDefaults);
      }
    }

    /**
     * Perform the actual permissions.grantPermit() call & store Permit object in request
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      let permitGrant = this.reflector.get<PermitGrantArgs>('permitGrant', context.getHandler());
      const req = context.switchToHttp().getRequest();

      if (permitGrant === false) {
        // @PermitGrant(false) means we explicitly DO NOT want to protect this method/endpoint at all.
        // So we `canActivate` always true, even for requests with no User present.

        // @todo: set a dummy "allow all Permit" instead of just false, to allow all Permit functionality to be used in the app.
        // for now we set this to false so @GetPermit fails with the right message.
        req.__permissions_permit__ = false;
        return true;
      }

      if (!permitGrant) permitGrant = {};

      const resource = permitGrant.resource || guardOptions.resource;
      if (!resource)
        throw new HttpException(
          'SA-Permissions NestJS: `resource` to permit.grantPermit() against is not configured for this route',
          HttpStatus.INTERNAL_SERVER_ERROR
        );

      const user = await this.extractUserFromRequest(req);

      const resourceIdKey = permitGrant.resourceIdKey || 'id';
      const projectResourceId: TProjectTo =
        permitGrant.projectResourceId ||
        guardOptions.projectResourceId ||
        this.defaultProjectResourceId;
      const resourceId = projectResourceId(req.params[resourceIdKey]);

      const resourceIdsKey = permitGrant.resourceIdsKey || 'ids';
      const resourceIds = req.params[resourceIdsKey];
      const grantPermitQuery = {
        resource,
        user,
        resourceId,
        action: permitGrant.action || context.getHandler().name,
      };
      const permit: Permit<Tid, Tid> = await this.permissions.grantPermit(
        grantPermitQuery as GrantPermitQuery<Tid, Tid>
      );

      // check requested `resourceIds` exist in permit.listOwn
      if (!permit.anyGranted && _.isArray(resourceIds)) {
        let ownResourceIds: Tid[] = [];
        let nonOwnResourceIds: Tid[] = [];

        // Check if permit.listOwn() is supported (i.e we have found at least one listOwned hook
        if (permit.isListOwnSupported()) {
          ownResourceIds = await permit.listOwn();
          nonOwnResourceIds = _.difference(resourceIds, ownResourceIds);
        } else {
          // Otherwise (i.e. when `limitOwn` is used), check each for the resourceId using `isOwn()`
          for (const resourceIdToCheck of resourceIds)
            if (!(await permit.isOwn(resourceIdToCheck))) nonOwnResourceIds.push(resourceIdToCheck); // break if one found to optimise
        }

        // ignore nonOwnResourceIds if ownResourceIds === null, cause `listOwn()` returning null means "allow all"
        if (!_.isEmpty(nonOwnResourceIds) && ownResourceIds !== null) {
          throw new HttpException(
            `SA-Permissions NestJS: Cant access Non-Own ResourceIds ids: [${nonOwnResourceIds.join(
              ', '
            )}]`,
            HttpStatus.FORBIDDEN
          );
        }
      }

      req.__permissions_permit__ = permit;
      return permit.granted;
    }
  }

  // Background: although we have the `PermissionsGuard` factory that returns a new configured *class* each time we call it,
  // the NestJS runtime creates only one instance of this Guard class (whichever happens to come first), UNLESS each Class has a unique class name.
  // By changing the name of the class before the factory returns it, we force NestJS to instantiate each of them, and hence it works as expected.
  return nameAClass(`ConcretePermissionsGuard_${randomString()}`, ConcretePermissionsGuard);
};
