import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { UserService } from '../../../application/services/UserService';

export class UserController {
    constructor(
        private userService: UserService
    ) { }

    async getUserProfile(_: Request, res: Response) {
        try {
            const userId = 1;
            const profile = await this.userService.getUserProfile(userId);

            ResponseUtil.success(res, profile, 'User profile retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve user profile', 500, error.message);
        }
    }

    async updateUserProfile(req: Request, res: Response) {
        try {
            const userId = 1;
            const profileData = req.body;
            await this.userService.updateUserProfile(userId, profileData);

            ResponseUtil.success(res, null, 'User profile updated successfully');
        }catch (error: any) {
            ResponseUtil.error(res, 'Failed to update user profile', 500, error.message);
        }
    }

    async getUsers(req: Request, res: Response) {
        try {   
            const filters = req.query;
            const users = await this.userService.getUsers(filters);

            ResponseUtil.success(res, users, 'Users retrieved successfully');
        }catch(error: any) {
            ResponseUtil.error(res, 'Failed to retrieve users', 500, error.message);
        }
    }
}