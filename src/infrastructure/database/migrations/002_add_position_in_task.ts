import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('tasks')
        .addColumn('position_id', 'integer', (col) => col.defaultTo(0).notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('tasks')
        .dropColumn('position_id')
        .execute();
}