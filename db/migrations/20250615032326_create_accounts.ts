import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.uuid('id').primary();
    table.text('name').notNullable();
    table.text('email').notNullable().unique();
    table.text('password').notNullable();
    table.text('avatar_url');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('accounts');
}

