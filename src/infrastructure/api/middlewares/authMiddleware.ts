import { NextFunction, Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { JWTService, UserMetadata } from '../utils/JWTService';

export interface AuthenticatedRequest extends Request {
	user?: UserMetadata;
}

export const authMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		ResponseUtil.unauthorized(res, 'Authorization header is required');
		return;
	}

	const [scheme, token] = authHeader.split(' ');

	if (scheme !== 'Bearer' || !token) {
		ResponseUtil.unauthorized(res, 'Invalid authorization format');
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
