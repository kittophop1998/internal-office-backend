import { ITaskRepository } from "../repositories/taskRepo";
import dayjs from "dayjs";

export class TaskService {
    constructor(
        private taskRepository: ITaskRepository
    ) { }

    async create(input: any): Promise<void> {
        const inputToSave = {
            title: input.title,
            type: input.type,
            subtype: input.subType,
            description: input.description,
            weight: input.weight,
            position_id: input.positionId,
            sort_order: input.sortOrder,
            created_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
            deleted_at: null
        };

        await this.taskRepository.create(inputToSave);
    }

    async update(taskId: number, input: any): Promise<void> {
        const taskToUpdate = {
            title: input.title,
            type: input.type,
            subtype: input.subType,
            description: input.description,
            weight: input.weight,
            position_id: input.positionId,
            sort_order: input.sortOrder,
            updated_at: dayjs().toDate()
        };
        
        await this.taskRepository.update(taskId, taskToUpdate);
    }

    async getTasks(): Promise<any[]> {
        return await this.taskRepository.getTasks();
    }

    async getTaskById(taskId: number): Promise<any> {
        return await this.taskRepository.getTaskById(taskId);
    }

    async delete(taskId: number): Promise<void> {
        await this.taskRepository.delete(taskId);
    }

    async getTaskAssignments(userId: number): Promise<any[]> {
        return await this.taskRepository.getTaskAssignments(userId);
    }

    async assignTask(input: any): Promise<void> {
        const inputAssign = {
            task_id: input.task_id,
            user_id: input.user_id,
            assigned_at: dayjs().toDate(),
            assigned_by: input.assigned_by,
            created_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
            deleted_at: null
        };

        await this.taskRepository.assignTask(inputAssign);
    }

    async createTaskSession(userId: number, type: string, branchId: number): Promise<void> {
        const sessionDate = dayjs().startOf('day').toDate();
        const isExists = await this.taskRepository.isTaskSessionExists(userId, sessionDate);
        if (isExists) {
            throw new Error("Task session already exists for this user, date, and type.");
        }

        const tasks = await this.taskRepository.getTaskAssignments(userId, { type });
        if(tasks.length === 0) {
            throw new Error("No task assignments found for this user and type.");
        }

        const taskSession = tasks.map((item) => ({
            session_date: sessionDate,
            task_id: item.task_id,
            user_id: userId,
            branch_id: branchId,
            type: type,
            status: 'PENDING',
            started_at: sessionDate,
            completed_at: null,
            approved_by: null,
            approved_at: null,
            manager_comment: '',
            created_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
            deleted_at: null
        }));

        await this.taskRepository.createTaskSession(taskSession);
    }

    async checkTaskSessionExists(userId: number): Promise<boolean> {
        const date = dayjs().startOf('day').toDate();
        return await this.taskRepository.isTaskSessionExists(userId, date);
    }

    async isTaskSessionExists(userId: number): Promise<boolean> {
        const date = dayjs().startOf('day').toDate();
        return await this.taskRepository.isTaskSessionExists(userId, date);
    }

    async getTaskSessions(filter: any): Promise<any[]> {
        return await this.taskRepository.getTaskSessions(filter);
    }

    async updateTaskSessionStatus(sessionId: number, status: string): Promise<void> {
        await this.taskRepository.updateTaskSessionStatus(sessionId, status);
    }
}