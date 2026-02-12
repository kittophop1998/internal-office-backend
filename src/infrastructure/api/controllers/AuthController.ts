import { Request, Response } from "express";
import { ResponseUtil } from "../utils/Response";
import { AuthService } from "../../../application/services/AuthService";

export class AuthController {
    private readonly COOKIE_NAME = 'accessToken';
    private readonly COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

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

            // Set HTTP-only cookie with the token
            res.cookie(this.COOKIE_NAME, result.accessToken, {
                httpOnly: true,           // ป้องกัน JavaScript access (XSS protection)
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                sameSite: 'lax',          // CSRF protection
                maxAge: this.COOKIE_MAX_AGE,
                path: '/',
            });

            // Return user data without token (token is in cookie)
            const { accessToken, ...userData } = result;
            ResponseUtil.success(res, userData, 'Login successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Login failed', 500, error.message);
        }
    }

    logout = async (_req: Request, res: Response) => {
        try {
            // Clear the cookie
            res.clearCookie(this.COOKIE_NAME, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });

            ResponseUtil.success(res, null, 'Logout successful');
        } catch (error: any) {
            ResponseUtil.error(res, 'Logout failed', 500, error.message);
        }
    }
}