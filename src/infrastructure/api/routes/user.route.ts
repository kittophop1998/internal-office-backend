import { Router } from "express";
import { UserRepository } from "../../database/UserRepository";
import { UserService } from "../../../application/services/UserService";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function setupUserRoute() {
    const router = Router();

    /**
     * Repository
     */
    const userRepo = new UserRepository();

    /**
     * Service
     */
    const userService = new UserService(userRepo);

    /**
     * Controller
     */
    const userController = new UserController(userService);

    /**
     * Routes
     */
    router.post("/", authMiddleware, (req, res) => userController.createUser(req, res));
    router.get("/", authMiddleware, (req, res) => userController.getUsers(req, res));
    router.get("/:id", authMiddleware, (req, res) => userController.getUserById(req, res));
    router.put("/:id", authMiddleware, (req, res) => userController.updateUserById(req, res));

    return router;
}