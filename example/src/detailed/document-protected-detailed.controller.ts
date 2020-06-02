import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ALL_DOCUMENTS,
  IDocument,
} from '@superawesome/permissions/dist/__tests__/data.fixtures';
import {
  PermitGrant,
  createPermissionsGuard,
  GetPermit,
  InjectPermissions,
} from '@superawesome/permissions-nestjs';
import { Permit, Permissions } from '@superawesome/permissions';
import { documentPermissionDefinitions } from '../permissions/document.permissions';

// omitted imports

/**
 The `createPermissionsGuard()` is essential,
 if we want to protect our Controller with SuperAwesome Permissions.

 It creates an instance of a Permissions NestJS Guard, configured for ALL the endpoints/methods in this controller.

 We then pass this instance to nestjs @UseGuards.
 */
@UseGuards(
  createPermissionsGuard(
    {
      /**
       The default `resource` (eg "document") this Guard will use for `permissions.grantPermit({resource, ...})` (Optional).

       __Notes__ :

       - Can be overridden per method with `@PermitGrant()`.

       - You're advised to have a default `resource` here, at the controller level.
      */
      resource: 'document',

      /**
       Project (i.e map) a `resourceId` on your QueryParams (by default the param named "id"), from string
       to what is needed by the ownership hooks (eg a `number`) for this controller (Optional).

       __Notes__ :

       - It should be able to tolerate if `resourceId` is missing or null etc and not throw.

       - We can also have `projectResourceId` as default at module level at `PermissionsModule.forRoot()`,
       i.e working for the whole module/app.
       Here we can override for this Guard only, if that's needed (rare).

       - We can also override all at `@PermitGrant()` level only for that endpoint (even more rare).
      */
      projectResourceId: id => parseInt(id, 10),
    },

    /**
     Add any relevant PermissionDefinitions as 2nd argument (Optional).

     __Notes__:

     - If we 've already added the specific `documentPermissionDefinitions` from './document.permissions'
       somewhere (either in our module or another controller) we dont need to add them again
       (we'll actually get a warning of "redefining action in a PD with same attributes" if we do).

     __Notes__:

     - The PDs are of type `IPermissionDefinitionStringOwnHooks`, see below.
    */
    documentPermissionDefinitions,

    /**
     Add any relevant PermissionDefinitionDefaults as 3rd argument,
     used as defaults only for the PermissionDefinitions at the 2nd argument (Optional).
    */
    { resource: 'document' },
  ),
)
@Controller('/documents-protected-detailed')
export class DocumentProtectedDetailedController {
  constructor(
    /**
     Optionally, we can inject the SAPermission instance that PermissionsModule has build for us,
     so we can manually permit / deny access to resources or do any other things with it - see `securityHole` method below.
     */
    @InjectPermissions() private permissions: Permissions,
  ) {}

  /**
   The @PermitGrant method decorator is optional, it allows us to configure an endpoint.
   All its arguments are also optional.
   If omitted, the default @PermitGrant is in place, as all methods using the `@UseGuards(createPermissionsGuard(...))` are protected by default.
   Pass `@PermitGrant(false)` to disable this - see below.
   */
  @PermitGrant({
    /**
     If the name of the method is different than the action name, we can override it here (Optional).
     Ideally we should not, its great if they are consistent.
     */
    action: 'read',

    /**
     If the @Get param for our `resourceId` is different than the default "id",
     we can override it with `resourceIdKey` (Optional).
     Ideally we should always go with "id" .
    */
    resourceIdKey: 'documentId',

    /**
     If want to override the "resource" this endpoint is dealing with
     (i.e the one configured above at the `createPermissionsGuard`), we can override it here (Optional).
     */
    resource: 'document',

    /**
     If want to override the projection function this endpoint is using
     (i.e the one configured above at the `createPermissionsGuard`), we can override it here (Optional).
     */
    projectResourceId: Number,
  })
  @Get('/:documentId')
  async single(
    @Param('documentId', new ParseIntPipe()) id: number,
    /**
     The @GetPermit parameter decorator injects this method's Permit object into our method (Optional).
     Useful for resource filtering, attribute picking etc.

     __Notes__:

     - It is already configured with the current user, action, resource & optionally resourceId if it exists.

     - If `resourceId` exists, then the Guard checks the User's ownership of the specific
       resource item and throws a 403 (FORBIDDEN) before even hitting the method body.
     */
    @GetPermit() permit: Permit,
  ): Promise<Partial<IDocument>> {
    return await permit.pick(ALL_DOCUMENTS.find(doc => doc.id === id));
  }

  /**
   An empty `@PermitGrant()` can be omitted, if we don't override anything from its args (i.e `PermitGrantArgs`).

   In this case "action" equals the method name "list", so its useless.

   __Notes__:

   - leaving without @PermitGrant() at all means "use default @PermitGrant()", like in this example.

   - The default `@PermitGrant()` has all the information it needs:

      - `user` from `extractUserFromRequest`, configured at the module.

      - `action` by default is the method's name.

      - `resource` by default from `createPermissionsGuard` 1st argument `GuardOptions.resource`

      - `resourceId` by default reading the request's prop named 'id'.
   */
  @PermitGrant()
  @Get()
  async list(
    @GetPermit() permit: Permit,
    @Query('any') any?: string,
  ): Promise<Partial<IDocument>[]> {
    /**
     Inside our method, we decide based on our rules **if we can allow any resource**
     OR if we need to filter only user's own.

     __Notes:__

     - In this example API call, if it has any='true' in its query params
     AND the user has `permit.anyGranted` for this action,
     then we allow all resources to pass, otherwise we limit only to their own.
     We could have thrown Forbidden if `permit.anyGranted` is false,
     or have any other kind of behavior, using `Permit` as our permissions guide.

     - In a realistic app, this is how you can restrict your DB or API etc results.
       The `permit.limitOwn()` method gives you infinite scalability, since its architecture
       is agnostic & hence compatible with any kind of data layer.

     - In this simplistic example our `permit.limitOwn()` produces just an Array.filter function.
       If we wanted to add restrictive clauses to a WHERE SQL query, it would be as easy as:

              `query.andWhere(new Brackets(qb => permit.limitOwn(qb)));`

       using TypeORM - read more in [`Permit.limitOwn()` docs](https://permissions.docs.superawesome.com/classes/Permit.html#limitOwn).

     - In a realistic app, most of this logic would live inside the Service layer,
       to which you just pass the `permit` object around for the duration of the request,
       for the actual advanced permissions checks and query building to be taking place.
     */
    const allowedDocs =
      permit.anyGranted && any === 'true'
        ? ALL_DOCUMENTS
        : ALL_DOCUMENTS.filter(permit.limitOwn());

    /** pick allowed attributes, depending on ownership of each resource item. */
    return await permit.mapPick(allowedDocs);
  }

  /**
   If we want to completely disable the @PermitGrant check for an endpoint/method
   and bypass the Guard, then we **must** pass `false` to `@PermitGrant()`.
   */
  @PermitGrant(false)
  @Post('/security-hole')
  securityHole() {
    /**
     Anyone can access this method bypassing the Guard, even requests without a user.

     But we have the injected permissions instance to the rescue!

     We can use permissions.grantPermit() the usual way, manually passing our user, resource, action etc, and get back a Permit object and then manually permit or deny actions.

     Or we can just introspect our permissions instance, for example:
     */
    return [
      'These are all actions, roles, resources and PermissionDefinitions of this Permissions instance.',
      this.permissions.getActions(),
      this.permissions.getRoles(),
      this.permissions.getResources(),
      this.permissions.getDefinitions({ resource: 'document' }),
    ];
  }
}
