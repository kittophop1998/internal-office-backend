import { Request, Response } from "express";
import { ResponseUtil } from "../utils/Response";
import { AuthService } from "../../../application/services/AuthService";

export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    login = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                ResponseUtil.error(res, 'Username and password are required', 400);
                return;
            }

            const result = await this.authService.login({ username, password });
            ResponseUtil.success(res, result, 'Login successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Login failed', 500, error.message);
        }
    }
}