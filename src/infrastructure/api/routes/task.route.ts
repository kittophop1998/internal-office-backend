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
    router.post("/", (req, res) => taskController.create(req, res));
    router.get("/", (req, res) => taskController.getTasks(req, res));

    router.get("/sessions/check/:userId", (req, res) => taskController.checkTaskSessionExists(req, res));
    router.get("/sessions", authMiddleware, (req, res) => taskController.getTaskSessions(req, res));
    router.post("/sessions", (req, res) => taskController.createTaskSession(req, res));
    router.put("/sessions/:id", (req, res) => taskController.updateTaskSession(req, res));

    router.post("/assign", (req, res) => taskController.assignTask(req, res));
    router.get("/assignments/:userId", (req, res) => taskController.getTaskAssignments(req, res));

    router.delete("/:id", (req, res) => taskController.deleteTask(req, res));
    router.get("/:id", (req, res) => taskController.getTaskById(req, res));
    router.put("/:id", (req, res) => taskController.update(req, res));
    return router;
}