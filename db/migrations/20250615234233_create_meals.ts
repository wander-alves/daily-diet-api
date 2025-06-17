import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.boolean('is_on_diet').notNullable();
    table.uuid('user_id').notNullable();
    table.datetime('registered_at').defaultTo(knex.raw(`(datetime('now', 'localtime'))`));
    table.datetime('created_at').defaultTo(knex.raw(`(datetime('now', 'localtime'))`));
    table.datetime('updated_at').defaultTo(knex.raw(`(datetime('now', 'localtime'))`));
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}

