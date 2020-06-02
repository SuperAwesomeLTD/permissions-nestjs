import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ALL_DOCUMENTS,
  IDocument,
} from '@superawesome/permissions/dist/__tests__/data.fixtures';

@Controller('/documents')
export class DocumentUnprotectedController {
  @Get('/:id')
  async read(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<IDocument> {
    return ALL_DOCUMENTS.find(doc => doc.id === id);
  }

  @Get()
  async list(): Promise<IDocument[]> {
    return ALL_DOCUMENTS;
  }
}
