import { Router } from "express";
import multer from "multer";
import { TaskRepository } from "../../database/TaskRepository";
import { TaskService } from "../../../application/services/TaskService";
import { TaskController } from "../controllers/TaskController";
import { authMiddleware } from "../middlewares/authMiddleware";

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 3 // Maximum 3 files
    },
    fileFilter: (_req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

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
    router.get("/", (req, res) => taskController.getTasks(req, res));

    router.get("/sessions-check", authMiddleware, (req, res) => taskController.checkTaskSessionExists(req, res));
    router.get("/sessions", authMiddleware, (req, res) => taskController.getTaskSessions(req, res));
    router.post("/sessions", authMiddleware, (req, res) => taskController.createTaskSession(req, res));
    router.put("/sessions", (req, res) => taskController.updateTaskSession(req, res));
    router.put('/sessions/upload/:id', upload.array('files', 3), (req, res) => taskController.uploadImageTaskSession(req, res));

    router.post("/assign", (req, res) => taskController.assignTask(req, res));
    router.get("/assignments/:userId", (req, res) => taskController.getTaskAssignments(req, res));

    router.delete("/:id", (req, res) => taskController.deleteTask(req, res));
    router.get("/:id", (req, res) => taskController.getTaskById(req, res));
    router.put("/:id", (req, res) => taskController.update(req, res));
    return router;
}