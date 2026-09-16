import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.APP_USERNAME = 'test-user';
process.env.APP_PASSWORD = 'test-password';
process.env.DB_PATH = ':memory:';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'test-user', password: 'test-password' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.accessToken).toEqual(expect.any(String));
        expect(body.user).toEqual({ id: expect.any(Number), username: 'test-user' });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
