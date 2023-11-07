import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
// import { setupApp } from '../setupApp';
describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // setupApp(app);

    await app.init();
  });

  it('handles a signup request', () => {
    const request_email = 'dada2@dada.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: request_email, password: 'dada' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(request_email);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'sdsd@sd.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123d' })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
