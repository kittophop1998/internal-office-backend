import { Router } from "express";
import { TaskRepository } from "../../database/TaskRepository";
import { TaskService } from "../../../application/services/TaskService";
import { TaskController } from "../controllers/TaskController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function setupTaskRoute() {
    const router = Router();

    /**
     * Repository 
     */
    const taskRepo = new TaskRepository();

    /**
     * Service
     */
    const taskService = new TaskService(taskRepo);

    /**
     * Controller
     */
    const taskController = new TaskController(taskService);

    /**
     * Routes
     */
    router.post("/", authMiddleware, (req, res) => taskController.create(req, res));
    router.get("/", authMiddleware, (req, res) => taskController.getTasks(req, res));
    router.delete("/:id", authMiddleware, (req, res) => taskController.deleteTask(req, res));
    router.get("/:id", authMiddleware, (req, res) => taskController.getTaskById(req, res));
    router.put("/:id", authMiddleware, (req, res) => taskController.update(req, res));
    return router;
}