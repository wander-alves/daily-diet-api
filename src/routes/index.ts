import { FastifyInstance } from "fastify";
import { accountRoutes } from "./accounts";

export async function routes(router: FastifyInstance) {
  router.register(accountRoutes, {
    prefix: '/accounts'
  });
}