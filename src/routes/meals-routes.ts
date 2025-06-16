import type { FastifyInstance } from 'fastify';

import { string, z } from 'zod';

import { knex } from '../database';
import { zodErrorsFormatter } from '../utils/zod-errors-formatter';
import { randomUUID } from 'node:crypto';
import { checkSessionId } from '../middlewares/check-session-id';

export async function mealRoutes(server: FastifyInstance) {
  server.addHook('preHandler', checkSessionId);

  server.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string().min(3, 'o nome precisa ter ao menos 3 caractéres').max(80, 'um nome pode ter no máximo 80 caractéres'),
      description: z.string().min(8, 'a descrição precisa ter no mínimo 8 caractéres'),
      date: z.date({
        message: 'infome uma data válida ex.: DD/MM/YYYY',
        coerce: true
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
        registered_at: date.toISOString().substring(0, 19).replace('T', ' '),
        is_on_diet,
        user_id: request.userId
      })
    } catch (err) {
      console.log(err)
      return reply.status(500).send({
        message: 'ocorreu um erro interno no servidor.'
      });
    }

    return reply.status(204).send();
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

  server.delete('/:id', async (request, reply) => {
    const deleteMealRequestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const queryParams = deleteMealRequestParamsSchema.safeParse(request.params);

    if (queryParams.success === false) {
      const errors = zodErrorsFormatter(queryParams.error.issues);
      return reply.status(400).send({
        message: 'Requisição inválida',
        errors
      });
    }

    const { id } = queryParams.data;

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
}