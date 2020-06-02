import { IUser } from '@superawesome/permissions';

export const getUser = (): IUser => {
  return {
    id: 1,
    roles: ['EMPLOYEE'],
  };
};
