export interface IUserRepository {
    create(user: any): Promise<any>;
    update(id: number, user: any): Promise<any>;
    findByUsername(username: string): Promise<any | null>;
    findById(id: number): Promise<any | null>;
    findAll(filters: any): Promise<any[]>;
    userbranchCreate(userId: number, userBranch: any): Promise<any>;
}