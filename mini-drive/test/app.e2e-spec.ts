import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const uploadDir = mkdtempSync(join(tmpdir(), 'minidrive-e2e-'));
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.APP_USERNAME = 'test-user';
process.env.APP_PASSWORD = 'test-password';
process.env.DB_PATH = ':memory:';
process.env.UPLOAD_DIR = uploadDir;

describe('MiniDrive (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  it('faz login e rejeita credenciais inválidas', async () => {
    await request(app.getHttpServer()).post('/api/auth/login').send({ username: 'test-user', password: 'errada' }).expect(401);
    const response = await request(app.getHttpServer()).post('/api/auth/login').send({ username: 'test-user', password: 'test-password' }).expect(201);
    token = response.body.accessToken as string;
    expect(response.body.user).toEqual({ id: expect.any(Number), username: 'test-user' });
  });

  it('executa o ciclo completo de um arquivo', async () => {
    await request(app.getHttpServer()).get('/api/files').expect(401);
    const upload = await request(app.getHttpServer()).post('/api/files').set('Authorization', `Bearer ${token}`).attach('files', Buffer.from('conteúdo'), 'nota.txt').expect(201);
    expect(upload.body[0]).toMatchObject({ name: 'nota.txt', size: 9, mimeType: 'text/plain' });
    const id = upload.body[0].id as string;
    await request(app.getHttpServer()).patch(`/api/files/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'renomeado.txt' }).expect(200).expect(({ body }) => expect(body.name).toBe('renomeado.txt'));
    await request(app.getHttpServer()).get('/api/files').set('Authorization', `Bearer ${token}`).expect(200).expect(({ body }) => expect(body).toHaveLength(1));
    await request(app.getHttpServer()).delete(`/api/files/${id}`).set('Authorization', `Bearer ${token}`).expect(204);
  });

  afterAll(async () => {
    await app.close();
    rmSync(uploadDir, { recursive: true, force: true });
  });
});
