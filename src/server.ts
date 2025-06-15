import { fastify } from 'fastify';
import cookie from '@fastify/cookie';

import { routes } from './routes';

const server = fastify();

server.register(cookie);
server.register(routes);

export { server };