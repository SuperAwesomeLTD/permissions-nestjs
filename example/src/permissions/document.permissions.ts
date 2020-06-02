import * as _ from 'lodash';
import {
  PD_EXAMPLE_EMPLOYEE,
  PD_EXAMPLE_EMPLOYEE_MANAGER,
  PD_EXAMPLE_COMPANY_ADMIN,
} from '@superawesome/permissions/dist/__tests__/permissionDefinitions-examples.fixtures';
import { IPermissionDefinitionStringOwnHooks } from '@superawesome/permissions-nestjs';
const ownerHooks = ['isOwner', 'limitOwned', 'listOwned'];

export const documentPermissionDefinitions: IPermissionDefinitionStringOwnHooks[] = [
  {
    ...(_.omit(PD_EXAMPLE_EMPLOYEE, ownerHooks) as any),
    isOwner: 'isOwner_isUserCreatorOfDocument',
    limitOwned: 'limitOwned_listUserCreatedDocuments',
  },
  {
    ...(_.omit(PD_EXAMPLE_EMPLOYEE_MANAGER, ownerHooks) as any),
    isOwner: 'isOwner_isDocCreatedByMeAndMyManagedUsers',
    limitOwned: 'limitOwned_DocsOfMeAndMyManagedUsers',
  },
  {
    ...(_.omit(PD_EXAMPLE_COMPANY_ADMIN, ownerHooks) as any),
    isOwner: 'isOwner_isDocCreatedByMeAndMyCompanyUsers',
    limitOwned: 'limitOwned_DocsOfMeAndMyCompanyUsers',
  },
];
