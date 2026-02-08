export interface IAuthRepository {
    login(credentials: { username: string; password: string }): Promise<any>;
}