import dayjs from "dayjs";
import { ITaskRepository } from "../../application/repositories/taskRepo";
import { db } from "./maria";

export class TaskRepository implements ITaskRepository {
    async create(input: any): Promise<number> {
        const result = await db
            .insertInto("tasks")
            .values(input)
            .executeTakeFirst();

        if (!result?.insertId) {
            throw new Error("Insert failed");
        }

        return Number(result.insertId);
    }

    async update(taskId: number, input: any): Promise<void> {
        await db
            .updateTable("tasks")
            .set(input)
            .where("id", "=", taskId)
            .execute();
    }

    async getTasks(filter?: any): Promise<any[]> {
        let query = await db
            .selectFrom("tasks")
            .where("deleted_at", "is", null);

        if (filter?.type) {
            query = query.where("type", "=", filter.type);
        }

        query = query.orderBy("sort_order", "asc");
        const tasks = await query
            .selectAll()
            .execute();

        return tasks;
    }

    async getTaskById(taskId: number): Promise<any> {
        const task = await db
            .selectFrom("tasks")
            .innerJoin("task_assignments", "tasks.id", "task_assignments.task_id")
            .innerJoin("users", "task_assignments.user_id", "users.id")
            .select([
                "tasks.id",
                "tasks.title",
                "tasks.description",
                "tasks.type",
                "tasks.subtype",
                "tasks.weight",
                "tasks.sort_order",
                "task_assignments.id as assignment_id",
                "task_assignments.user_id as assigned_user_id",
                "users.full_name as assigned_user_name"
            ])
            .where("tasks.id", "=", taskId)
            .where("tasks.deleted_at", "is", null)
            .execute();

        const tasksGrouped = task.reduce((acc: any, curr: any) => {
            if (!acc) {
                acc = {
                    id: curr.id,
                    title: curr.title,
                    description: curr.description,
                    type: curr.type,
                    subtype: curr.subtype,
                    weight: curr.weight,
                    sort_order: curr.sort_order,
                    assignments: []
                };
            }
            acc.assignments.push({
                assignment_id: curr.assignment_id,
                user_id: curr.assigned_user_id,
                user_name: curr.assigned_user_name
            });
            return acc;
        }, null);

        return tasksGrouped;
    }

    async delete(taskId: number): Promise<void> {
        await db
            .updateTable("tasks")
            .set({ deleted_at: new Date() })
            .where("id", "=", taskId)
            .execute();
    }

    async getTaskAssignments(userId: number, filter?: any): Promise<any[]> {
        let query = await db
            .selectFrom("task_assignments")
            .innerJoin("tasks", "task_assignments.task_id", "tasks.id")
            .where("task_assignments.user_id", "=", userId)
            .where("task_assignments.deleted_at", "is", null)
            .where("tasks.deleted_at", "is", null);

        if (filter?.type) {
            query = query.where("tasks.type", "=", filter.type);
        }

        const assignments = await query
            .select([
                "task_assignments.id as assignment_id",
                "task_assignments.assigned_at",
                "tasks.id as task_id",
                "tasks.title as task_title",
                "tasks.description as task_description",
                "tasks.type as task_type",
                "tasks.subtype as task_subtype"
            ])
            .execute();

        return assignments;
    }

    async assignTask(input: any): Promise<void> {
        await db.transaction().execute(async (trx) => {
            for (const item of input) {
                await trx
                    .insertInto("task_assignments")
                    .values(item)
                    .execute();
            }
        });
    }

    async createTaskSession(input: any): Promise<void> {
        await db
            .insertInto("task_sessions")
            .values(input)
            .execute();
    }

    async isTaskSessionExists(filter: any, date: Date): Promise<boolean> {
        const session = await db
            .selectFrom("task_sessions")
            .selectAll()
            .where("user_id", "=", filter.userId)
            .where("type", "=", filter.type as 'DAILY' | 'WEEKLY' | 'MONTHLY')
            .where("branch_id", "=", filter.branchId)
            .where("session_date", "=", date)
            .where("deleted_at", "is", null)
            .executeTakeFirst();

        return !!session;
    }

    async getTaskSessions(filter: any): Promise<any[]> {
        const today = dayjs().startOf('day').toDate();

        let query = await db
            .selectFrom("task_sessions")
            .innerJoin("tasks", "task_sessions.task_id", "tasks.id")
            .innerJoin("users", "task_sessions.user_id", "users.id")
            .leftJoin("task_session_attachments", "task_sessions.id", "task_session_attachments.task_session_id")
            .where("task_sessions.session_date", "=", today)
            .where("task_sessions.deleted_at", "is", null)
            .where("tasks.deleted_at", "is", null);

        if (filter.userId) {
            query = query.where("task_sessions.user_id", "=", filter.userId);
        }

        if (filter.type) {
            query = query.where("task_sessions.type", "=", filter.type as 'DAILY' | 'WEEKLY' | 'MONTHLY');
        }

        if (filter.subtype) {
            query = query.where("tasks.subtype", "=", filter.subtype as 'pre-opening' | 'pre-closing');
        }

        if (filter.branchId) {
            query = query.where("task_sessions.branch_id", "=", filter.branchId);
        }

        if (filter.positionId) {
            query = query.where("users.position_id", "=", filter.positionId);
        }

        if (filter.status) {
            query = query.where("task_sessions.status", "=", filter.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED');
        }

        const sessions = await query
            .select([
                "task_sessions.id as session_id",
                "task_sessions.session_date",
                "task_sessions.status",
                "tasks.id as task_id",
                "tasks.title as task_title",
                "tasks.description as task_description",
                "task_sessions.score as session_score",
                "task_sessions.manager_comment",
                "task_session_attachments.id as attachment_id",
                "task_session_attachments.file_url as attachment_url",
                "users.id as user_id",
                "users.full_name as user_name"
            ])
            .execute();

        return sessions;
    }

    async updateTaskSessions(inputs: any[]): Promise<void> {
        await db.transaction().execute(async (trx) => {
            for (const input of inputs) {
                const { session_id, ...updateData } = input;

                await trx
                    .updateTable("task_sessions")
                    .set({
                        ...updateData,
                        updated_at: dayjs().toDate()
                    })
                    .where("id", "=", session_id)
                    .execute();
            }
        });
    }

    async taskSessionAttachments(taskSessionId: number, image_url: string): Promise<void> {
        await db
            .insertInto("task_session_attachments")
            .values({
                task_session_id: taskSessionId,
                file_url: image_url,
                created_at: dayjs().toDate()
            })
            .execute();
    }
}