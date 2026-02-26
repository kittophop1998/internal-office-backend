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

    async getTasks(filter: any): Promise<any[]> {
        let query = await db
            .selectFrom("tasks")
            .innerJoin("task_groups", "tasks.group_id", "task_groups.id")
            .where("tasks.deleted_at", "is", null);

        if (filter.type) {
            query = query.where("tasks.type", "=", filter.type);
        }

        if (filter.groupId) {
            query = query.where("tasks.group_id", "=", filter.groupId);
        }

        query = query.orderBy("tasks.sort_order", "asc");
        const tasks = await query
            .select([
                "tasks.id",
                "tasks.title",
                "tasks.description",
                "tasks.type",
                "tasks.subtype",
                "tasks.weight",
                "tasks.sort_order as sortOrder",
                "task_groups.name as groupName"
            ])
            .execute();

        return tasks;
    }

    async getTaskById(taskId: number): Promise<any> {
        const task = await db
            .selectFrom("tasks")
            .innerJoin("task_groups", "tasks.group_id", "task_groups.id")
            .leftJoin("task_assignments", "tasks.id", "task_assignments.task_id")
            .leftJoin("users", "task_assignments.user_id", "users.id")
            .select([
                "tasks.id",
                "tasks.title",
                "tasks.description",
                "tasks.type",
                "tasks.subtype",
                "tasks.weight",
                "task_groups.id as group_id",
                "task_groups.name as group_name",
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
                    groupId: curr.group_id,
                    groupName: curr.group_name,
                    sortOrder: curr.sort_order,
                    assignments: []
                };
            }
            acc.assignments.push({
                assignmentId: curr.assignment_id,
                userId: curr.assigned_user_id,
                userName: curr.assigned_user_name
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

    async assignTask(taskId: number, input: any): Promise<void> {
        const assign = await db
            .selectFrom("task_assignments")
            .selectAll()
            .where("task_id", "=", taskId)
            .execute();

        if (assign.length > 0) {
            await db
                .deleteFrom("task_assignments")
                .where("task_id", "=", taskId)
                .execute();
        }

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

    async isTaskSessionExists(input:any): Promise<boolean> {
        const session = await db
            .selectFrom("task_sessions")
            .selectAll()
            .where("user_id", "=", input.userId)
            .where("type", "=", input.type as 'DAILY' | 'WEEKLY' | 'MONTHLY')
            .where("branch_id", "=", input.branchId)
            .where("session_date", "=", input.date)
            .where("deleted_at", "is", null)
            .executeTakeFirst();

        return !!session;
    }

    async getTaskSessions(filter: any): Promise<any[]> {
        const today = dayjs().startOf('day').format('YYYY-MM-DD');

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

        if (filter.branchId) {
            query = query.where("task_sessions.branch_id", "=", filter.branchId);
        }

        if (filter.status) {
            query = query.where("task_sessions.status", "=", filter.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED');
        }

        if (filter.type) {
            query = query.where("task_sessions.type", "=", filter.type as 'DAILY' | 'WEEKLY' | 'MONTHLY');
        }

        // if (filter.subtype) {
        //     query = query.where("tasks.subtype", "=", filter.subtype as 'pre-opening' | 'pre-closing');
        // }

        const sessions = await query
            .select([
                "task_sessions.id as id",
                "task_sessions.session_date as date",
                "task_sessions.status as status",
                "task_sessions.type as sessionType",
                "tasks.id as taskId",
                "tasks.title as taskTitle",
                "tasks.description as taskDescription",
                "task_sessions.score as sessionScore",
                "task_sessions.manager_comment as managerComment",
                "task_session_attachments.id as attachmentId",
                "task_session_attachments.file_url as attachmentUrl",
                "users.id as userId",
                "users.full_name as userName"
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