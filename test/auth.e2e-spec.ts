import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const random = Math.floor(Math.random() * 999);
    const email = `test-e2e-${random}@mail.com`;
    console.log('email', email);
    const password = '123456';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: password,
      })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });
  it('signup as a new user then get the currently logged in user', async () => {
    const random = Math.floor(Math.random() * 999);
    const email = `test-e2e-${random}@mail.com`;
    const password = '123456';
    const rest = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: password,
      })
      .expect(201);
    const cookie = rest.get('Set-Cookie');
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);
    expect(body.email).toEqual(email);
  });
});
