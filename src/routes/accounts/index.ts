import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { hash, compare } from 'bcrypt';
import { randomUUID } from 'node:crypto';

import { knex } from '../../database';
import { zodErrorsFormatter } from '../../utils/zod-errors-formatter';

export async function accountRoutes(server: FastifyInstance) {
  server.post('/', async (request, reply) => {
    const createAccountBodySchema = z.object({
      name: z.string(),
      email: z.string().email('E-mail inválido'),
      password: z.string().min(8, 'Sua senha precisa ter ao menos 8 dígitos.'),
    });

    const accountBody = createAccountBodySchema.safeParse(request.body);

    if (accountBody.success === false) {
      const errors = zodErrorsFormatter(accountBody.error.issues)
      return reply.status(400).send({
        message: 'Dados inválidos. Por favor, revise os campos.',
        errors
      })
    }

    const { name, email, password } = accountBody.data;
    const hashedPassword = await hash(password, 6);

    try {
      await knex('accounts').insert({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
      });
    } catch (error) {
      if (String(error).includes('email')) {
        return reply.status(400).send({
          message: 'O e-mail informado já está cadastrado.'
        });
      }
      return reply.status(500).send({
        message: 'ocorreu um erro interno no servidor.'
      });
    }

    return reply.status(201).send();
  });

  server.post('/auth', async (request, reply) => {
    const authBodySchema = z.object({
      email: z.string().email('E-mail inválido.'),
      password: z.string(),
    })

    const authBody = authBodySchema.safeParse(request.body);

    if (authBody.success === false) {
      const errors = zodErrorsFormatter(authBody.error.issues);
      return reply.status(400).send({
        message: 'Dados inválidos. Verifique os campos preenchidos',
        errors,
      });
    }
    const { email, password } = authBody.data;

    const user = await knex('accounts').select('email', 'password').where('email', email).first();
    if (!user) {
      invalidAuthMessage()
    }

    const isPasswordMatching = await compare(password, user.password)
    if (!isPasswordMatching) {
      invalidAuthMessage()
    }

    function invalidAuthMessage() {
      return reply.status(401).send({
        message: 'Usuário e/ou senha inválidos. Por favor, revise os dados.'
      })
    }
    const cookieMaxAge = 60 * 60 * 24 * 7;
    await reply.cookie('session_id', {
      maxAge: cookieMaxAge
    })

    return reply.status(204).send()
  });
}
