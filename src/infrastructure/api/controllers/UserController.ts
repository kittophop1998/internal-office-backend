import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { UserService } from '../../../application/services/UserService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class UserController {
    constructor(
        private userService: UserService
    ) { }

    async createUser(req: Request, res: Response) {
        try {
            const userData = req.body;
            await this.userService.createUser(userData);

            ResponseUtil.success(res, null, 'User created successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to create user', 500, error.message);
        }
    }

    async getUserProfile(_: Request, res: Response) {
        try {
            const userId = 1;
            const profile = await this.userService.getUserProfile(userId);

            ResponseUtil.success(res, profile, 'User profile retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve user profile', 500, error.message);
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const filters = req.query;
            const users = await this.userService.getUsers(filters);

            ResponseUtil.success(res, users, 'Users retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve users', 500, error.message);
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);
            const user = await this.userService.getUserProfile(userId);

            ResponseUtil.success(res, user, 'User retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve user', 500, error.message);
        }
    }

    async updateUserById(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);
            const userData = req.body;
            await this.userService.updateUserProfile(userId, userData);

            ResponseUtil.success(res, null, 'User updated successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to update user', 500, error.message);
        }
    }

    async updateCurrentBranchIdByUserId(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const currentBranchId = req.body.currentBranchId;
            await this.userService.updateCurrentBranchIdByUserId(userId, currentBranchId);
            
            ResponseUtil.success(res, null, 'User profile updated successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to update user profile', 500, error.message);
        }
    }
}