import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../../../application/services/AuthService";
import { UserRepository } from "../../database/UserRepository";

export function setupAuthRoute() {
    const router = Router();

    /**
     * Repositories
     */
    const userRepository = new UserRepository();

    /**
     * Services
     */
    const authService = new AuthService(userRepository);

    /**
     * Controller
     */
    const authController = new AuthController(authService);

    router.post('/login', (req, res) => authController.login(req, res));
    router.post('/logout', (req, res) => authController.logout(req, res));

    return router;
}