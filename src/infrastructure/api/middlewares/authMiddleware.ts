import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { JWTService, UserMetadata } from '../utils/JWTService';

export interface AuthenticatedRequest extends Request {
	user?: UserMetadata;
}

const COOKIE_NAME = 'accessToken';

export const authMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): void => {
	// ลองดึง token จาก cookie ก่อน
	let token = req.cookies?.[COOKIE_NAME];

	// ถ้าไม่มีใน cookie ให้ลองดูจาก Authorization header (fallback)
	if (!token) {
		const authHeader = req.headers.authorization;
		if (authHeader) {
			const [scheme, headerToken] = authHeader.split(' ');
			if (scheme === 'Bearer' && headerToken) {
				token = headerToken;
			}
		}
	}

	if (!token) {
		ResponseUtil.unauthorized(res, 'Authentication required');
		return;
	}

	try {
		const decoded = JWTService.verifyToken(token);
		req.user = decoded;
		res.locals.user = decoded;
		next();
	} catch (error: any) {
		ResponseUtil.unauthorized(res, error?.message || 'Invalid or expired token');
	}
};
