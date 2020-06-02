import { IUser, PermissionDefinition, IPermissionsOptions, Tid } from '@superawesome/permissions';

/**
 * @internal
 */
export const PERMISSIONS_TOKEN = 'PERMISSIONS_TOKEN';
export const PERMISSIONS_OWNERSHIP_SERVICE_TOKEN = 'PERMISSIONS_OWNERSHIP_SERVICE_TOKEN';
/**
 * @internal
 */
export const PERMISSIONS_EXTRACT_USER_FROM_REQUEST_TOKEN =
  'PERMISSIONS_EXTRACT_USER_FROM_REQUEST_TOKEN';
/**
 * @internal
 */
export const PERMISSIONS_MAP_RESOURCE_ID_TOKEN = 'PERMISSIONS_MAP_RESOURCE_ID_TOKEN';

/**
 The `extractUserFromRequest` callback extracts and returns an `IUser {id: TId; roles: string[]}`.

 Usually our User is in `req.user` object or similar, placed by our authentication middleware.
 Alternatively you can use something like request-context or its newer cls-hooked incarnations etc.

 If `req.user` complies already, you can omit this callback as `defaultExtractUserFromRequest` does it for you.

 You can use also to inject test or hardcode environment users etc.
*/
export type TExtractUserFromRequest<TUserId extends Tid = number> = (
  req: any
) => Promise<IUser<TUserId>>;

/**
 * Project from one value to another, used to project req to our ResourceId (projectResourceId)
 */
export type TProjectTo<TResourceId extends Tid = number> = (paramStr: string) => TResourceId;

/**
 **PermissionDefinitions** in SuperAwesome Permissions for NestJS have an important difference to [Permissions ones](https://permissions.docs.superawesome.com/additional-documentation/detailed-usage-&-examples.html): all ownership hooks are replaced with a string name, corresponding to a method name in the PermissionOwnershipService.

 This is cause [its currently impossible](https://stackoverflow.com/questions/55560858/in-nest-js-is-it-possible-to-get-service-instance-inside-a-param-decorator) to [inject on a guard/decorator](https://github.com/nestjs/nest/issues/1038) on nestjs. See code comments in createPermissionsGuard for more context.

 __Note:__ If a method declared in IPermissionDefinitionStringOwnHooks is missing from PermissionsOwnershipService, you'll get an exception at module build time.
 */
export interface IPermissionDefinitionStringOwnHooks
  extends Omit<PermissionDefinition, 'isOwner' | 'listOwned' | 'limitOwned'> {
  isOwner?: string;
  listOwned?: string;
  limitOwned?: string;
}

export interface IPermissionsModuleOptions<
  TUserId extends Tid = number,
  TResourceId extends Tid = number
> extends IPermissionsOptions<TUserId> {
  extractUserFromRequest?: TExtractUserFromRequest<TUserId>;
  projectResourceId?: TProjectTo<TResourceId>;
}
