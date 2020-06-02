import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ALL_DOCUMENTS,
  IDocument,
} from '@superawesome/permissions/dist/__tests__/data.fixtures';
import {
  createPermissionsGuard,
  GetPermit,
} from '@superawesome/permissions-nestjs';
import { Permit } from '@superawesome/permissions';
import { documentPermissionDefinitions } from '../permissions/document.permissions';

// prettier-ignore
@UseGuards(createPermissionsGuard({ resource: 'document' }, documentPermissionDefinitions))
@Controller('/documents-protected-simple')
export class DocumentProtectedSimpleController {
  @Get('/:id')
  async read(
    @Param('id', new ParseIntPipe()) id: number,
    @GetPermit() permit: Permit,
  ): Promise<Partial<IDocument>> {
    return await permit.pick(ALL_DOCUMENTS.find(doc => doc.id === id));
  }

  @Get()
  async list(@GetPermit() permit: Permit): Promise<Partial<IDocument>[]> {
    return await permit.filterPick(ALL_DOCUMENTS);
  }
}
