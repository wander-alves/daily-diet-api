import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/cookie';

import { knex } from '../database/';

export async function checkSessionId(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { sessionId } = request.cookies;

  if (!sessionId) {
    return reply.status(401).send({
      message: 'Sessão expirada. Por favor, efetue o login novamente'
    });
  }

  const [, userId] = sessionId.split('@');
  const user = await knex('accounts').select('id', 'email').where({
    id: userId
  }).first();

  if (!user) {
    return reply.status(401).send({
      message: 'Sessão expirada. Por favor, efetue o login novamente'
    });
  }

  request.userId = userId;
}