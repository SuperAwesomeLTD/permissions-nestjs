import * as request from 'supertest';
import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import {
  ALL_DOCUMENTS,
  isUserCreatorOfDocument,
} from '@superawesome/permissions/dist/__tests__/data.fixtures';

import { ExampleSimpleModule } from '../simple/example-simple.module';
import { ExampleDetailedModule } from '../detailed/example-detailed.module';

const findDocument = documentId => _.find(ALL_DOCUMENTS, { id: documentId });

let injectedUser = null;
jest.mock('../permissions/getUser', () => ({ getUser: () => injectedUser }));

describe.each([
  ['/documents-protected-simple', ExampleSimpleModule],
  ['/documents-protected-detailed', ExampleDetailedModule],
])(`Documents Controller example e2e tests (%s)`, (endpoint, module) => {
  const isFull = _.endsWith(endpoint, 'detailed');
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [module],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => await app.close());

  describe('Permissions & ownership allowed attributes', () => {
    describe.each([
      [{ id: 1, roles: ['EMPLOYEE'] }, ['confidential']],
      [{ id: 2, roles: ['EMPLOYEE_MANAGER'] }, ['confidential']],
      [{ id: 4, roles: ['COMPANY_ADMIN'] }, []],
    ])('"read" action for user %s', (user, omitFields) => {
      it('returns allowed attributes on OWN resource', async () => {
        injectedUser = user;
        const documentId = user.id * 10;
        const document = findDocument(documentId);

        return request(app.getHttpServer())
          .get(`${endpoint}/${documentId}`)
          .expect(200)
          .expect(_.omit(document, omitFields));
      });

      it('returns forbidden on NON OWN resource', async () => {
        injectedUser = user;
        const documentId = user.id * 10;

        return request(app.getHttpServer())
          .get(`${endpoint}/${documentId * 1000}`)
          .expect(403);
      });
    });
  });

  describe('"list" action', () => {
    if (isFull)
      it('return only OWN documents only with allowed attributes', async () => {
        injectedUser = { id: 1, roles: ['EMPLOYEE'] };

        return request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
          .expect(
            ALL_DOCUMENTS.filter(doc =>
              isUserCreatorOfDocument({
                user: injectedUser,
                resourceId: doc.id,
              }),
            ).map(doc => _.omit(doc, ['confidential'])),
          );
      });

    it(`return ALL documents${
      isFull ? ' by using "any=true" param' : ''
    }, but only with allowed attributes depending on ownership of each item`, async () => {
      injectedUser = { id: 1, roles: ['EMPLOYEE'] };

      return request(app.getHttpServer())
        .get(`${endpoint}${isFull ? '?any=true' : ''}`)
        .expect(200)
        .expect(
          ALL_DOCUMENTS.map(doc =>
            isUserCreatorOfDocument({
              user: injectedUser,
              resourceId: doc.id,
            })
              ? _.omit(doc, ['confidential'])
              : _.pick(doc, ['title', 'date']),
          ),
        );
    });

    if (isFull)
      it('forbids "any=true" if user doesnt have "list:any" granted', async () => {
        injectedUser = { id: 4, roles: ['COMPANY_ADMIN'] };

        return request(app.getHttpServer())
          .get(`${endpoint}?any=true`)
          .expect(403);
      });
  });

  if (isFull) {
    describe('"securityHole" endpoint', () => {
      it('allows access even if no user is authenticated', async () => {
        injectedUser = null;
        return request(app.getHttpServer())
          .post(`${endpoint}/security-hole`)
          .expect(201);
      });
    });
  }
});
