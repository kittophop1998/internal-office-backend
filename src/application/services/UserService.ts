import { IUserRepository } from "../repositories/userRepo";

export class UserService {
    constructor(
        private userRepository: IUserRepository
    ) {}

    async getUsers(filters: any) {
        const users = await this.userRepository.findAll(filters);
        return users;
    }

    async getUserProfile(userId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        return {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            department_id: user.department_id,
            is_approved: user.is_approved,
            position_id: user.position_id,
            role: user.role,
        };
    }

    async updateUserProfile(userId: number, profileData: Partial<any>) {
        const userToSave = {
            full_name: profileData.fullName,
            email: profileData.email,
            department_id: profileData.departmentId,
            position_id: profileData.positionId,
        };

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        Object.assign(user, userToSave);

        await this.userRepository.update(user);
    }
}