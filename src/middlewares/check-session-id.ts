import { FastifyRequest, FastifyReply } from 'fastify';
import { } from '@fastify/cookie'

import { knex } from '../database/';

export async function checkSessionId(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const sessionId = request.cookies['@daily-diet:sessionId'];

  if (!sessionId) {
    return reply.status(401).send({
      message: 'Sessão expirada. Por favor, efetue o login novamente'
    });
  }

  const user = await knex('accounts').select('id', 'email').where({
    session_id: sessionId
  }).first();

  if (!user) {
    return reply.status(401).send({
      message: 'Sessão expirada. Por favor, efetue o login novamente'
    });
  }

  request.userId = user.id;
}