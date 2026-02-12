import { Router } from "express";
import { UserRepository } from "../../database/UserRepository";
import { UserService } from "../../../application/services/UserService";
import { UserController } from "../controllers/UserController";

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
    router.get("/", (req, res) => userController.getUsers(req, res));
    router.get("/:id", (req, res) => userController.getUserById(req, res));
    router.put("/:id", (req, res) => userController.updateUserById(req, res));

    return router;
}