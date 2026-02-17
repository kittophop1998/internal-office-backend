import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { TaskService } from '../../../application/services/TaskService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class TaskController {
    constructor(
        private taskService: TaskService
    ) { }

    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const taskData = req.body;
            await this.taskService.create(userId, taskData);

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
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve task', 500, error.message);
        }
    }

    async deleteTask(req: Request, res: Response) {
        try {
            const taskId = Number(req.params.id);
            await this.taskService.delete(taskId);

            ResponseUtil.success(res, null, 'Task deleted successfully');
        } catch (error: any) {
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
        } catch (error: any) {
            ResponseUtil.error(res, 'Task assignment failed', 500, error.message);
        }
    }

    // ##### Controller For Tasks Sessions
    async createTaskSession(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const type = req.body.type as string;
            const branchId = Number(req.body.branchId);
            await this.taskService.createTaskSession(userId, type, branchId);

            ResponseUtil.success(res, null, 'Session created successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Session creation failed', 500, error.message);
        }
    }

    async checkTaskSessionExists(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const branchId = Number(req.query.branchId);
            const type = req.query.type as string;

            const filter = {
                userId,
                type,
                branchId
            };
            const exists = await this.taskService.checkTaskSessionExists(filter);

            ResponseUtil.success(res, { exists }, 'Session existence checked successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to check session existence', 500, error.message);
        }
    }

    async getTaskSessions(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = Number(req.user?.id);
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
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve sessions', 500, error.message);
        }
    }

    async updateTaskSession(req: Request, res: Response) {
        try {
            const sessions = req.body as Array<{
                sessionId: number;
                status: string;
                attachmentId?: number;
            }>;

            await this.taskService.updateTaskSession(sessions);

            ResponseUtil.success(res, null, 'Task sessions updated successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Task session update failed', 500, error.message);
        }
    }

    async uploadImageTaskSession(req: Request, res: Response) {
        try {
            const taskSessionId = Number(req.params.id);
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                ResponseUtil.error(res, 'No files uploaded', 400);
                return;
            }

            if (files.length > 3) {
                ResponseUtil.error(res, 'Maximum 3 files allowed', 400);
                return;
            }

            const uploadedUrls = await this.taskService.uploadTaskSessionImages(taskSessionId, files);

            ResponseUtil.success(res, { uploadedUrls }, 'Task session images uploaded successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Task session image upload failed', 500, error.message);
        }
    }

    // ##### Controller For Tasks Session Review
    async getTaskSessionForReview(req: Request, res: Response) {
        try {
            const branchId = Number(req.query.branchId);
            const type = req.query.type?.toString() as 'DAILY' | 'WEEKLY' | 'MONTHLY';
            const positionId = Number(req.query.positionId);

            const filter = {
                branchId,
                positionId,
                type,
                status: 'COMPLETED'
            };
            const tasks = await this.taskService.getTaskSessions(filter);

            ResponseUtil.success(res, tasks, 'Tasks for review retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve tasks for review', 500, error.message);
        }
    }

    async updateTaskForReview(req: Request, res: Response) {
        try {
            await this.taskService.updateTaskSession(req.body);

            ResponseUtil.success(res, null, 'Task for review updated successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to update task for review', 500, error.message);
        }
    }
}