import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('tasks')
        .addColumn('group_id', 'integer', (col) => col.defaultTo(0).notNull())
        .execute();

    await db.schema
        .createTable('task_groups')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('percent_weight', 'integer', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('deleted_at', 'timestamp')
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('tasks')
        .dropColumn('group_id')
        .execute();

    await db.schema
        .dropTable('task_groups')
        .execute();
}