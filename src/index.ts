import { server } from './server';
import { env } from './infra/env';

const { HOST, PORT } = env;

server.listen({
  host: HOST,
  port: PORT,
}).then(() => {
  console.log(`server running on http://${HOST}:${PORT}/`)
});