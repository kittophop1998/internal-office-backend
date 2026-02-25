import { ITaskRepository } from "../repositories/taskRepo";
import dayjs from "dayjs";
import s3, { uploadFromMultipart } from "../../infrastructure/api/utils/s3";

export class TaskService {
    constructor(
        private taskRepository: ITaskRepository
    ) { }

    async create(userId: number, input: any): Promise<void> {
        const inputToSave = {
            title: input.title,
            type: input.type,
            subtype: input.subtype,
            description: input.description,
            weight: input.weight,
            group_id: input.groupId,
            position_id: input.positionId ?? 3,
            sort_order: input.sortOrder,
            created_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
            deleted_at: null
        };

        const taskId = await this.taskRepository.create(inputToSave);

        // Assign task to users
        const taskAssigns = input.users.map((item: any) => ({
            task_id: taskId,
            user_id: item,
            assigned_at: dayjs().toDate(),
            assigned_by: userId,
            created_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
            deleted_at: null
        }));

        await this.taskRepository.assignTask(taskAssigns);
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

    async getTasks(filter: any): Promise<any[]> {
        return await this.taskRepository.getTasks(filter);
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
        const sessionDate = dayjs().startOf('day').format('YYYY-MM-DD');
        const isExists = await this.taskRepository.isTaskSessionExists(userId, sessionDate);
        if (isExists) {
            throw new Error("Task session already exists for this user, date, and type.");
        }

        const tasks = await this.taskRepository.getTaskAssignments(userId, { type });
        if (tasks.length === 0) {
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

    async checkTaskSessionExists(filter: any): Promise<boolean> {
        const date = dayjs().format('YYYY-MM-DD');
        return await this.taskRepository.isTaskSessionExists(filter, date);
    }

    async isTaskSessionExists(userId: number): Promise<boolean> {
        const date = dayjs().format('YYYY-MM-DD');
        return await this.taskRepository.isTaskSessionExists(userId, date);
    }

    async getTaskSessions(filter: any): Promise<any[]> {
        const sessions = await this.taskRepository.getTaskSessions(filter);

        const groupedSessions = sessions.reduce((acc: any, curr: any) => {
            const existingSession = acc.find((s: any) => s.id === curr.id);

            if (existingSession) {
                if (curr.attachmentId && !existingSession.attachments.some((a: any) => a.attachmentId === curr.attachmentId)) {
                    existingSession.attachments.push({
                        attachmentId: curr.attachmentId,
                        attachmentUrl: curr.attachmentUrl
                    });
                }
            } else {
                const attachments = curr.attachmentId
                    ? [{ attachmentId: curr.attachmentId, attachmentUrl: curr.attachmentUrl }]
                    : [];

                acc.push({
                    id: curr.id,
                    date: curr.date,
                    status: curr.status,
                    taskId: curr.taskId,
                    taskTitle: curr.taskTitle,
                    taskDescription: curr.taskDescription,
                    sessionScore: curr.sessionScore,
                    managerComment: curr.managerComment,
                    userId: curr.userId,
                    userName: curr.userName,
                    attachments: attachments
                });
            }

            return acc;
        }, []);

        // Generate signed URLs for attachments
        const sessionsWithSignedUrls = await Promise.all(
            groupedSessions.map(async (session: any) => {
                if (session.attachments && session.attachments.length > 0) {
                    const attachmentsWithUrls = await Promise.all(
                        session.attachments.map(async (attachment: any) => {
                            if (attachment.attachmentUrl) {
                                try {
                                    const signedUrl = await s3.getSignedDownloadUrl({
                                        key: attachment.attachmentUrl,
                                        expiresIn: 3600,
                                    });
                                    return {
                                        attachmentId: attachment.attachmentId,
                                        attachmentUrl: signedUrl.url,
                                    };
                                } catch (error) {
                                    console.error(`Error generating signed URL for ${attachment.attachmentUrl}:`, error);
                                    return attachment;
                                }
                            }
                            return attachment;
                        })
                    );
                    return {
                        ...session,
                        attachments: attachmentsWithUrls,
                    };
                }
                return session;
            })
        );

        return sessionsWithSignedUrls;
    }

    async updateTaskSession(input: any[]): Promise<void> {
        const sessionMap = input.map((session: { sessionId: number; status: string; managerComment?: string }) => {
            return {
                session_id: session.sessionId,
                status: session.status.toLocaleUpperCase() as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED',
                manager_comment: session.managerComment ?? '',
            };
        });

        await this.taskRepository.updateTaskSessions(sessionMap);
    }

    async uploadTaskSessionImages(taskSessionId: number, files: Express.Multer.File[]): Promise<string[]> {
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const result = await uploadFromMultipart(file, 'internal-office/task-sessions');
            const fileUrl = result.key;

            await this.taskRepository.taskSessionAttachments(taskSessionId, fileUrl);
            uploadedUrls.push(fileUrl);
        }

        return uploadedUrls;
    }
}