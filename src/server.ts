import { fastify } from 'fastify';

const server = fastify().get('/', async () => {
  return 'Hello world';
});

export { server };