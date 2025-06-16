import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { knex } from '../database';
import { zodErrorsFormatter } from '../utils/zod-errors-formatter';
import { randomUUID } from 'node:crypto';

export async function mealRoutes(server: FastifyInstance) {
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
    const { sessionId } = request.cookies;

    if (!sessionId) {
      return reply.status(401).send({
        message: 'Sessão expirada. Por favor, efetue o login novamente'
      });
    }

    const [, userId] = sessionId.split('@');
    const user = await knex('accounts').select('id', 'email').where({
      id: userId
    });

    if (!user) {
      return reply.status(401).send({
        message: 'Sessão expirada. Por favor, efetue o login novamente'
      });
    }


    try {
      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        registered_at: date.toISOString().substring(0, 19).replace('T', ' '),
        is_on_diet,
      })
    } catch (err) {
      return reply.status(500).send({
        message: 'ocorreu um erro interno no servidor.'
      });
    }

    return reply.status(204).send();
  });
}