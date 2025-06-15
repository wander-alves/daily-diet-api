import knexClient, { Knex } from "knex";
import { env } from '../infra/env';

const { DB_CLIENT, DB_URL } = env;

const DB_CONNECTION = DB_CLIENT === 'pg' ? DB_URL : {
  filename: DB_URL
}

const config: Knex.Config = {
  client: env.DB_CLIENT,
  connection: DB_CONNECTION,
  migrations: {
    directory: './db/migrations',
  },
  useNullAsDefault: true,
};

const knex = knexClient(config);

export { knex, config }