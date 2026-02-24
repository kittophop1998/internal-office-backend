import { IUserRepository } from "../repositories/userRepo";
import { PasswordService } from "../../infrastructure/api/utils/PasswordService";

export class UserService {
    constructor(
        private userRepository: IUserRepository
    ) {}

    async createUser(userData: any) {
        const passwordHash = await PasswordService.hashPassword(userData.password);

        const userToSave = {
            full_name: userData.fullName,
            username: userData.username,
            password_hash: passwordHash,
            email: userData.email,
            department_id: userData.departmentId,
            role_id: userData.roleId
        };

        const createdUserId = await this.userRepository.create(userToSave);
        const createdUser = await this.userRepository.findById(Number(createdUserId));
        const userBranches = userData.branchIds.map((branchId: number) => ({
            user_id: createdUser.id,
            branch_id: branchId,
        }));

        await this.userRepository.userbranchCreate(createdUser.id, userBranches);
    }

    async getUsers(filters: any) {
        const users = await this.userRepository.findAll(filters);

        const grouped = users.reduce((acc: any[], user: any) => {
            const existing = acc.find((u) => u.id === user.id);
            const branch = user.branchId
                ? { branchId: user.branchId, branchName: user.branchName }
                : null;

            if (existing) {
                if (branch) existing.branches.push(branch);
            } else {
                acc.push({
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    roleId: user.roleId,
                    roleCode: user.roleCode,
                    roleName: user.roleName,
                    departmentId: user.departmentId,
                    departmentName: user.departmentName,
                    branches: branch ? [branch] : [],
                });
            }

            return acc;
        }, []);

        return grouped;
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
            role_id: profileData.roleId
        };

        await this.userRepository.update(userId, userToSave);

        const updateUserBranches = profileData.branchIds.map((branchId: number) => ({
            user_id: userId,
            branch_id: branchId,
        }));

        await this.userRepository.userbranchCreate(userId, updateUserBranches);
        console.log('4')
    }
}