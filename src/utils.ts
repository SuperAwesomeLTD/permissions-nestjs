import { IUser, isValidIUser, Tid } from '@superawesome/permissions';
import { UnauthorizedException } from '@nestjs/common';
import { TExtractUserFromRequest } from './types';

/**
 * @internal
 */
export const defaultExtractUserFromRequest: TExtractUserFromRequest<Tid> = async (
  req: any
): Promise<IUser> => {
  if (!req.user) {
    throw new UnauthorizedException(
      'SA-Permissions4NestJS(defaultExtractUserFromRequest): not found `req.user`'
    );
  }

  const user: IUser = {
    ...req.user,
    id: req.user.id,
    roles: req.user.roles || [],
  };

  if (!isValidIUser(user)) {
    throw new UnauthorizedException(
      'SA-Permissions4NestJS(defaultExtractUserFromRequest): `req.user` is not a valid `interface IUser {id: TId; roles: string[];}`'
    );
  }

  return user;
};

/**
 * @internal
 * @see https://stackoverflow.com/a/48813707/799502 @todo: improve with a `theClass: ClassType<T>` like definition
 * @param className
 * @param theClass
 */
export const nameAClass = <T>(className: string, theClass): T =>
  ({ [className]: class extends theClass {} }[className] as any);

/**
 * returns a short uuid-like string
 * @internal
 */
export const randomString = () =>
  Math.random()
    .toString(36)
    .slice(2, 15);
