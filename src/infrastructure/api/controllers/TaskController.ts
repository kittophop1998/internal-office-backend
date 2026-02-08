import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { TaskService } from '../../../application/services/TaskService';

export class TaskController {
    constructor(
        private taskService: TaskService
    ) { }

    async create(req: Request, res: Response) {
        try {
            const taskData = req.body;
            await this.taskService.create(taskData);

            ResponseUtil.success(res, null, 'Task created successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Task creation failed', 500, error.message);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const taskId = Number(req.params.id);
            const taskData = req.body;
            await this.taskService.update(taskId, taskData);

            ResponseUtil.success(res, null, 'Task updated successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Task update failed', 500, error.message);
        }
    }

    async getTasks(_: Request, res: Response) {
        try {
            const tasks = await this.taskService.getTasks();

            ResponseUtil.success(res, tasks, 'Tasks retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve tasks', 500, error.message);
        }
    }

    async getTaskById(req: Request, res: Response) {
        try {
            const taskId = Number(req.params.id);
            const task = await this.taskService.getTaskById(taskId);

            ResponseUtil.success(res, task, 'Task retrieved successfully');
        }catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve task', 500, error.message);
        }
    }

    async deleteTask(req: Request, res: Response) {
        try {
            const taskId = Number(req.params.id);
            await this.taskService.delete(taskId);

            ResponseUtil.success(res, null, 'Task deleted successfully');
        }catch(error: any) {
            ResponseUtil.error(res, 'Task deletion failed', 500, error.message);
        }
    }

    async getTaskAssignments(req: Request, res: Response) {
        try {
            const userId = Number(req.params.userId);
            const assignments = await this.taskService.getTaskAssignments(userId);

            ResponseUtil.success(res, assignments, 'Task assignments retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve task assignments', 500, error.message);
        }
    }

    async assignTask(req: Request, res: Response) {
        try {
            const assignmentData = req.body;
            await this.taskService.assignTask(assignmentData);

            ResponseUtil.success(res, null, 'Task assigned successfully');
        }catch(error: any) {
            ResponseUtil.error(res, 'Task assignment failed', 500, error.message);
        }
    }

    async createTaskSession(req: Request, res: Response) {
        try {
            const userId = 1;
            const type = req.query.type as string;
            const branchId = Number(req.query.branchId);
            await this.taskService.createTaskSession(userId, type, branchId);

            ResponseUtil.success(res, null, 'Session created successfully');
        }catch (error: any) {
            ResponseUtil.error(res, 'Session creation failed', 500, error.message);
        }
    }

    async checkTaskSessionExists(_: Request, res: Response) {
        try {
            const userId = 1;
            const exists = await this.taskService.checkTaskSessionExists(userId);

            ResponseUtil.success(res, { exists }, 'Session existence checked successfully');
        }catch(error: any) {
            ResponseUtil.error(res, 'Failed to check session existence', 500, error.message);
        }
    }

    async getTaskSessions(req: Request, res: Response) {
        try {
            const userId = res.locals.user.id;
            const branchId = Number(req.query.branchId);
            const type = req.query.type as string;
            const subtype = req.query.subtype as string ?? null;

            const filter = {
                userId,
                type,
                subtype,
                branchId
            };
            const sessions = await this.taskService.getTaskSessions(filter);

            ResponseUtil.success(res, sessions, 'Sessions retrieved successfully');
        }catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve sessions', 500, error.message);
        }
    }

    async updateTaskSession(req: Request, res: Response) {
        try {
            const sessionId = Number(req.params.id);
            const { status } = req.body;
            await this.taskService.updateTaskSessionStatus(sessionId, status);

            ResponseUtil.success(res, null, 'Task session updated successfully');
        }catch(error: any) {
            ResponseUtil.error(res, 'Task session update failed', 500, error.message);
        }
    }
}