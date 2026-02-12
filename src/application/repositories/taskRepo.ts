export interface ITaskRepository {
    create(input: any): Promise<number>;
    update(taskId: number, input: any): Promise<void>;
    getTasks(filter?: any): Promise<any[]>;
    getTaskById(taskId: number): Promise<any>;
    delete(taskId: number): Promise<void>;

    getTaskAssignments(userId: number, filter?: any): Promise<any[]>;
    assignTask(input: any): Promise<void>;

    createTaskSession(input: any): Promise<void>;
    isTaskSessionExists(filter: any, date: Date): Promise<boolean>;
    getTaskSessions(filter: any): Promise<any[]>;
    updateTaskSessions(inputs: any[]): Promise<void>;
    taskSessionAttachments(taskSessionId: number, image_url: string): Promise<void>;
}