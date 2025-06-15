import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { knex } from '../database';
import { zodErrorsFormatter } from '../utils/zod-errors-formatter';

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
    const cookies = request.cookies;
    console.log(cookies);

    return reply.send('meals')
  });
}