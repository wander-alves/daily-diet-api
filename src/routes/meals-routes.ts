import type { FastifyInstance } from 'fastify';

import { z } from 'zod';

import { knex } from '../database';
import { zodErrorsFormatter } from '../utils/zod-errors-formatter';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/check-session-id';
import { formatDate } from '../utils/format-date';

export async function mealRoutes(server: FastifyInstance) {
  server.addHook('preHandler', checkSessionId);

  server.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string().min(3, 'o nome precisa ter ao menos 3 caractéres').max(80, 'um nome pode ter no máximo 80 caractéres'),
      description: z.string().min(8, 'a descrição precisa ter no mínimo 8 caractéres'),
      date: z.coerce.date({
        message: 'infome uma data válida ex.: DD/MM/YYYY HH:MM',
      }),
      is_on_diet: z.coerce.boolean(),
    });

    const mealBody = createMealBodySchema.safeParse(request.body);
    if (mealBody.success === false) {
      const errors = zodErrorsFormatter(mealBody.error.issues);
      return reply.status(400).send({
        message: 'Dados inválidos.',
        errors,
      })
    };

    const { name, description, date, is_on_diet } = mealBody.data;

    try {
      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        registered_at: formatDate(date),
        is_on_diet,
        user_id: request.userId
      })
    } catch (err) {
      console.log(err)
      return reply.status(500).send({
        message: 'ocorreu um erro interno no servidor.'
      });
    }

    return reply.status(201).send();
  });

  server.get('/', async (request, reply) => {
    const meals = await knex('meals').select('id', 'name', 'description', 'is_on_diet', 'registered_at').where(
      { user_id: request.userId }
    )

    return reply.send({
      total: meals.length,
      meals,
    })
  });

  server.get('/:id', async (request, reply) => {
    const getMealRouteParamSchema = z.object({
      id: z.string().uuid()
    });

    const routeParams = getMealRouteParamSchema.safeParse(request.params)
    if (routeParams.success === false) {
      const errors = zodErrorsFormatter(routeParams.error.issues);
      return reply.status(400).send({
        message: 'Requisição inválida',
        errors
      });
    }

    const { id } = routeParams.data;

    const meal = await knex('meals')
      .select('id', 'name', 'description', 'is_on_diet', 'registered_at')
      .where({
        id,
        user_id: request.userId
      })
      .first();

    if (!meal) {
      console.log(`Meal ${id} not found for user ${request.userId}`)
      return reply.status(404).send({
        message: 'Refeição não localizada.'
      })
    }

    return reply.send({
      meal,
    })
  });

  server.delete('/:id', async (request, reply) => {
    const deleteMealRequestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const routeParams = deleteMealRequestParamsSchema.safeParse(request.params);

    if (routeParams.success === false) {
      const errors = zodErrorsFormatter(routeParams.error.issues);
      return reply.status(400).send({
        message: 'Requisição inválida',
        errors
      });
    }

    const { id } = routeParams.data;

    const result = await knex('meals').where({
      id,
      user_id: request.userId,
    }).delete().returning('*');
    if (!result) {
      console.log(`meal ${id} not found for user ${request.userId}`);
      return reply.status(404).send({
        message: 'Refeição não localizada.'
      });
    }

    return reply.status(204).send();

  });

  server.put('/:id', async (request, reply) => {
    const getMealRouteParamSchema = z.object({
      id: z.string().uuid()
    });

    const createMealBodySchema = z.object({
      name: z.string().min(3, 'o nome precisa ter ao menos 3 caractéres').max(80, 'um nome pode ter no máximo 80 caractéres').optional(),
      description: z.string().min(8, 'a descrição precisa ter no mínimo 8 caractéres').optional(),
      date: z.date({
        message: 'infome uma data válida ex.: DD/MM/YYYY',
        coerce: true
      }).optional(),
      is_on_diet: z.coerce.boolean().optional(),
    });

    const routeParams = getMealRouteParamSchema.safeParse(request.params)
    if (routeParams.success === false) {
      const errors = zodErrorsFormatter(routeParams.error.issues);
      return reply.status(400).send({
        message: 'Requisição inválida',
        errors
      });
    }

    const mealBody = createMealBodySchema.safeParse(request.body);
    if (mealBody.success === false) {
      const errors = zodErrorsFormatter(mealBody.error.issues);
      return reply.status(400).send({
        message: 'Dados inválidos.',
        errors,
      })
    };

    const { id } = routeParams.data;
    const { name, description, date, is_on_diet } = mealBody.data;

    const meal = await knex('meals').where({
      id,
      user_id: request.userId
    })
      .select('*')
      .first();

    if (!meal) {
      console.log(`Meal ${id} not found for user ${request.userId}`);
      return reply.status(404).send({
        message: 'Refeição não localizada.'
      });
    }

    meal.name = name ?? meal.name;
    meal.description = description ?? meal.description;
    meal.is_on_diet = is_on_diet ?? meal.is_on_diet;
    meal.registered_at = date?.toISOString().substring(0, 19).replace('T', ' ') ?? meal.registered_at;
    meal.updated_at = new Date().toISOString().substring(0, 19).replace('T', ' ');

    await knex('meals').where({ id }).update(meal);

    return reply.status(204).send();
  });

  server.get('/metrics', async (request, reply) => {
    const meals = await knex('meals').where({
      user_id: request.userId
    }).orderBy('registered_at');

    const total = meals.length;
    const totalOnDietMeals = meals.filter((meal) => meal.is_on_diet == true).length;
    const totalNonDietMeals = total - totalOnDietMeals;

    const onDietStreak = meals.reduce((acc, meal) => {
      if (meal.is_on_diet) {
        acc += 1;
      } else {
        acc = 0;
      }
      return acc;
    }, 0);

    return reply.send({
      meals_metrics: {
        total,
        total_on_diet: totalOnDietMeals,
        total_out_diet: totalNonDietMeals,
        current_streak: onDietStreak
      }
    })
  });
}