export interface ITaskRepository {
    create(input: any): Promise<void>;
    update(taskId: number, input: any): Promise<void>;
    getTasks(filter?: any): Promise<any[]>;
    getTaskById(taskId: number): Promise<any>;
    delete(taskId: number): Promise<void>;

    getTaskAssignments(userId: number, filter?: any): Promise<any[]>;
    assignTask(input: any): Promise<void>;

    createTaskSession(input: any): Promise<void>;
    isTaskSessionExists(userId: number, date: Date): Promise<boolean>;
    getTaskSessions(userId: number, type: string, branchId: number): Promise<any[]>;
    updateTaskSessionStatus(sessionId: number, status: string): Promise<void>;
    taskSessionAttachments(taskSessionId: number, image_url: string): Promise<void>;
}