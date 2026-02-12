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
            position_id: input.positionId ?? 3,
            sort_order: input.sortOrder,
            created_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
            deleted_at: null
        };

        const taskId = await this.taskRepository.create(inputToSave);
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
        const date = dayjs().startOf('day').toDate();
        return await this.taskRepository.isTaskSessionExists(filter, date);
    }

    async isTaskSessionExists(userId: number): Promise<boolean> {
        const date = dayjs().startOf('day').toDate();
        return await this.taskRepository.isTaskSessionExists(userId, date);
    }

    async getTaskSessions(filter: any): Promise<any[]> {
        const sessions = await this.taskRepository.getTaskSessions(filter);

        const groupedSessions = sessions.reduce((acc: any, curr: any) => {
            const existingSession = acc.find((s: any) => s.session_id === curr.session_id);

            if (existingSession) {
                if (curr.attachment_id && !existingSession.attachments.some((a: any) => a.attachment_id === curr.attachment_id)) {
                    existingSession.attachments.push({
                        attachment_id: curr.attachment_id,
                        attachment_url: curr.attachment_url
                    });
                }
            } else {
                const attachments = curr.attachment_id
                    ? [{ attachment_id: curr.attachment_id, attachment_url: curr.attachment_url }]
                    : [];

                acc.push({
                    session_id: curr.session_id,
                    session_date: curr.session_date,
                    status: curr.status,
                    task_id: curr.task_id,
                    task_title: curr.task_title,
                    task_description: curr.task_description,
                    session_score: curr.session_score,
                    manager_comment: curr.manager_comment,
                    user_id: curr.user_id,
                    user_name: curr.user_name,
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
                            if (attachment.attachment_url) {
                                try {
                                    const signedUrl = await s3.getSignedDownloadUrl({
                                        key: attachment.attachment_url,
                                        expiresIn: 3600,
                                    });
                                    return {
                                        ...attachment,
                                        attachment_url: signedUrl.url,
                                    };
                                } catch (error) {
                                    console.error(`Error generating signed URL for ${attachment.attachment_url}:`, error);
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