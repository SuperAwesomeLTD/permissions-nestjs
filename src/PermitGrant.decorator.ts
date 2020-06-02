import { SetMetadata } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { TProjectTo } from './types';

/**
 * See [reference in details example](/additional-documentation/reference-&-detailed-example.html)
 */
export class PermitGrantQuery {
  action?: string;

  resource?: string;

  resourceIdKey?: string;

  resourceIdsKey?: string;

  projectResourceId?: TProjectTo;
}
export type PermitGrantArgs = PermitGrantQuery | false;

/**
 An optional method/endpoint Guard that allows you to either:

 a) turn off the guard for this endpoint, by passing the literal `false`. This will make the endpoint open to even non authenticated users.

 b) Pass an object of type `PermitGrantQuery` to set one or more of:

  - a `resource` name different than the Controller's `createPermissionsGuard` default `resource`.

  - an `action` name different than the method's name.

  - a `resourceIdKey` name different than just `id`.

  - a `resourceIdsKey` name different than just `ids`.

 See [reference in detailed example](/additional-documentation/reference-&-detailed-example.html)

 @param permitGrant: PermitGrantQuery | false
 */
export const PermitGrant = (permitGrantArgs: PermitGrantArgs = {}): CustomDecorator =>
  SetMetadata('permitGrant', permitGrantArgs);
