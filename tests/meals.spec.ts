import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import supertest from 'supertest';
import { execSync } from 'node:child_process';

import { server as appServer } from '../src/server';

describe('Meals routes', async () => {
  beforeAll(async () => {
    appServer.ready();
  });

  afterAll(async () => {
    await appServer.close()
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to register a meal', async () => {
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

    const meal = {
      name: 'Test meal',
      description: 'Some test food on a test stack',
      is_on_diet: true,
      date: new Date(2025, 4, 1, 6, 30)
    }

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send(meal)
      .expect(201)
  });

  it('should be able to get all registered meals', async () => {
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

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: true,
        date: new Date(2025, 4, 1, 6, 30)
      })
      .expect(201);

    const result = await supertest(appServer.server)
      .get('/meals')
      .set('Cookie', cookies!)

    expect(result.body.meals).toEqual([
      expect.objectContaining({
        name: 'Test meal',
        description: 'Some test food on a test stack',
      })
    ])
  });

  it('should be able to get a single meal', async () => {
    const account = {
      name: 'John Doe',
      email: 'john.doe@example.net',
      password: 'heavyandstrongpassword',
    }

    await supertest(appServer.server)
      .post('/accounts')
      .send(account).expect(201)

    const authResponse = await supertest(appServer.server)
      .post('/accounts/auth')
      .send({
        email: account.email,
        password: account.password
      })
      .expect(204);
    const cookies = authResponse.get('Set-Cookie');

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: true,
        date: new Date(2025, 4, 1, 6, 30)
      })
      .expect(201);

    const meals = await supertest(appServer.server)
      .get('/meals')
      .set('Cookie', cookies!);

    const id = meals.body.meals[0].id;

    const response = await supertest(appServer.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookies!)
      .expect(200);

    expect(response.body.meal).toEqual(
      expect.objectContaining(
        {
          name: 'Test meal',
          description: 'Some test food on a test stack',
        }
      )
    )
  });

  it('should be able to delete a single meal', async () => {
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

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: true,
        date: new Date(2025, 4, 1, 6, 30)
      })
      .expect(201);

    const result = await supertest(appServer.server)
      .get('/meals')
      .set('Cookie', cookies!)

    const meal = result.body.meals[0];

    await supertest(appServer.server)
      .delete(`/meals/${meal.id}`)
      .set('Cookie', cookies!)
      .expect(204);
  });

  it('should be able to edit a single meal', async () => {
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

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: true,
        date: new Date(2025, 4, 1, 6, 30)
      })
      .expect(201);

    const result = await supertest(appServer.server)
      .get('/meals')
      .set('Cookie', cookies!)

    const meal = result.body.meals[0];

    await supertest(appServer.server)
      .put(`/meals/${meal.id}`)
      .set('Cookie', cookies!)
      .send({
        name: 'Test3',
        description: 'A new test of a meal register'
      })
      .expect(204);

    const editedMeals = await supertest(appServer.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    const editedMeal = editedMeals.body.meals[0];

    expect(editedMeal).toEqual(
      expect.objectContaining({
        name: 'Test3',
        description: 'A new test of a meal register'
      })
    )
  });

  it('should be able to get meals metrics', async () => {
    const account = {
      name: 'John Doe',
      email: 'john.doe@example.net',
      password: 'heavyandstrongpassword',
    }

    await supertest(appServer.server)
      .post('/accounts')
      .send(account).expect(201)

    const authResponse = await supertest(appServer.server)
      .post('/accounts/auth')
      .send({
        email: account.email,
        password: account.password
      })
      .expect(204);
    const cookies = authResponse.get('Set-Cookie');

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: false,
        date: new Date(2025, 4, 1, 11, 30)
      })
      .expect(201);

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: true,
        date: new Date(2025, 4, 1, 16, 30)
      })
      .expect(201);

    await supertest(appServer.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Test meal',
        description: 'Some test food on a test stack',
        is_on_diet: true,
        date: new Date(2025, 4, 1, 20, 0)
      })
      .expect(201);

    const response = await supertest(appServer.server)
      .get('/meals/metrics')
      .set('Cookie', cookies!)
      .expect(200);

    expect(response.body.meals_metrics).toEqual(
      expect.objectContaining({
        total: 3,
        total_on_diet: 2,
        total_out_diet: 1,
        current_streak: 2
      })
    )
  });
});