import fastify from 'fastify';
import cookie from '@fastify/cookie';

import { accountRoutes } from './routes/accounts-routes'
import { mealRoutes } from './routes/meals-routes';

const server = fastify();

server.register(cookie);
server.register(accountRoutes, {
  prefix: '/accounts'
});

server.register(mealRoutes, {
  prefix: '/meals'
});

server.get('/home', async (request, reply) => {
  reply.setCookie
})

export { server };