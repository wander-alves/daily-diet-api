import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('meals', (table) => {
    table.uuid('id').primary();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.boolean('is_on_diet').notNullable();
    table.uuid('user_id').notNullable();
    table.datetime('registered_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meals');
}

