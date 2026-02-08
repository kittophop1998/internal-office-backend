import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('task_sessions')
        .addColumn('branch_id', 'integer', (col) => col.defaultTo(0).notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('task_sessions')
        .dropColumn('branch_id')
        .execute();
}