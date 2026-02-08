import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('positions')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('code', 'varchar(50)', (col) => col.notNull())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('departments')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('branches')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('location', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('users')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('username', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('full_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('department_id', 'integer', (col) => col)
    .addColumn('position_id', 'integer', (col) => col.notNull())
    .addColumn('role', 'varchar(20)', (col) => col.notNull().defaultTo('STAFF'))
    .addColumn('branch_id', 'integer')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('tasks')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('type', 'varchar(20)', (col) => col.notNull())
    .addColumn('subtype', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('weight', 'integer', (col) => col.notNull())
    .addColumn('sort_order', 'integer', (col) => col.notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('task_assignments')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('task_id', 'integer', (col) => col.notNull())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('assigned_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('assigned_by', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('task_sessions')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('session_date', 'date', (col) => col.notNull())
    .addColumn('type', 'varchar(20)', (col) => col.notNull())
    .addColumn('task_id', 'integer', (col) => col.notNull())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('PENDING'))
    .addColumn('started_at', 'timestamp')
    .addColumn('completed_at', 'timestamp')
    .addColumn('approved_by', 'integer')
    .addColumn('approved_at', 'timestamp')
    .addColumn('manager_comment', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamp')
    .execute()

  await db.schema
    .createTable('task_session_attachments')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('task_session_id', 'integer', (col) => col.notNull())
    .addColumn('file_url', 'varchar(1024)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()

  await db.schema.createIndex('idx_positions_code').on('positions').column('code').execute()
  await db.schema.createIndex('idx_departments_name').on('departments').column('name').execute()
  await db.schema.createIndex('idx_branches_name').on('branches').column('name').execute()

  await db.schema.createIndex('idx_users_department_id').on('users').column('department_id').execute()
  await db.schema.createIndex('idx_users_position_id').on('users').column('position_id').execute()
  await db.schema.createIndex('idx_users_branch_id').on('users').column('branch_id').execute()
  await db.schema.createIndex('idx_users_role').on('users').column('role').execute()

  await db.schema.createIndex('idx_tasks_title').on('tasks').column('title').execute()
  await db.schema.createIndex('idx_tasks_weight').on('tasks').column('weight').execute()

  await db.schema.createIndex('idx_task_assignments_task_id').on('task_assignments').column('task_id').execute()
  await db.schema.createIndex('idx_task_assignments_user_id').on('task_assignments').column('user_id').execute()
  await db.schema.createIndex('idx_task_assignments_assigned_by').on('task_assignments').column('assigned_by').execute()

  await db.schema.createIndex('idx_task_sessions_task_id').on('task_sessions').column('task_id').execute()
  await db.schema.createIndex('idx_task_sessions_user_id').on('task_sessions').column('user_id').execute()
  await db.schema.createIndex('idx_task_sessions_session_date').on('task_sessions').column('session_date').execute()
  await db.schema.createIndex('idx_task_sessions_status').on('task_sessions').column('status').execute()

  await db.schema
    .createIndex('idx_task_session_attachments_task_session_id')
    .on('task_session_attachments')
    .column('task_session_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('task_session_attachments').ifExists().execute()
  await db.schema.dropTable('task_sessions').ifExists().execute()
  await db.schema.dropTable('task_assignments').ifExists().execute()
  await db.schema.dropTable('tasks').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
  await db.schema.dropTable('branches').ifExists().execute()
  await db.schema.dropTable('departments').ifExists().execute()
  await db.schema.dropTable('positions').ifExists().execute()
}
