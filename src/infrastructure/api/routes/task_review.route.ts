import { Router } from "express";
import { TaskRepository } from "../../database/TaskRepository";
import { TaskService } from "../../../application/services/TaskService";
import { TaskController } from "../controllers/TaskController";

export function setupTaskReviewRoute() {
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
    router.get("/", (req, res) => taskController.getTaskSessionForReview(req, res));
    router.put("/", (req, res) => taskController.updateTaskForReview(req, res));

    return router;
}