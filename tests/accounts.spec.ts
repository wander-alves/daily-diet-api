import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { execSync } from 'node:child_process'

import { server as appServer } from '../src/server';


describe('Accounts route', async () => {
  beforeAll(async () => {
    appServer.ready();
  });

  afterAll(async () => {
    await appServer.close()
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  });

  it('should be able to register a new account.', async () => {
    const account = {
      name: 'John Doe',
      email: 'john.doe@example.net',
      password: 'heavyandstrongpassword',
    }

    const response = await supertest(appServer.server)
      .post('/accounts')
      .send(account)

    expect(response.statusCode).toEqual(201)
  });

  it('should be able to authenticate an account', async () => {
    const account = {
      name: 'John Doe',
      email: 'john.doe@example.net',
      password: 'heavyandstrongpassword',
    }

    await supertest(appServer.server)
      .post('/accounts')
      .send(account).expect(201)

    const response = await supertest(appServer.server)
      .post('/accounts/auth')
      .send({
        email: account.email,
        password: account.password
      })
      .expect(204);
    const cookies = response.get('Set-Cookie');

    expect(cookies).toBeTruthy()
  })
});