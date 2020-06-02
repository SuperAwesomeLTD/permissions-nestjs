import { Injectable } from '@nestjs/common';
import {
  isOwner_isDocCreatedByMeAndMyCompanyUsers,
  isOwner_isDocCreatedByMeAndMyManagedUsers,
  isOwner_isUserCreatorOfDocument,
  limitOwned_DocsOfMeAndMyCompanyUsers,
  limitOwned_DocsOfMeAndMyManagedUsers,
  limitOwned_listUserCreatedDocuments,
} from '@superawesome/permissions/dist/__tests__/data.fixtures';

@Injectable()
export class PermissionsOwnershipService {
  // EMPLOYEE
  isOwner_isUserCreatorOfDocument = isOwner_isUserCreatorOfDocument;
  limitOwned_listUserCreatedDocuments = limitOwned_listUserCreatedDocuments;

  // EMPLOYEE_MANAGER
  isOwner_isDocCreatedByMeAndMyManagedUsers = isOwner_isDocCreatedByMeAndMyManagedUsers;
  limitOwned_DocsOfMeAndMyManagedUsers = limitOwned_DocsOfMeAndMyManagedUsers;

  // COMPANY_ADMIN
  isOwner_isDocCreatedByMeAndMyCompanyUsers = isOwner_isDocCreatedByMeAndMyCompanyUsers;
  limitOwned_DocsOfMeAndMyCompanyUsers = limitOwned_DocsOfMeAndMyCompanyUsers;
}
