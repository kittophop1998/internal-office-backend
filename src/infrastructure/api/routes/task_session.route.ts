import { Router } from "express";
import { TaskRepository } from "../../database/TaskRepository";
import { TaskService } from "../../../application/services/TaskService";
import { TaskController } from "../controllers/TaskController";
import { authMiddleware } from "../middlewares/authMiddleware";
import multer from "multer";

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

export function setupTaskSessionRoute() {
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
    router.get("/check", authMiddleware,(req, res) => taskController.checkTaskSessionExists(req, res));
    router.get("/", authMiddleware,(req, res) => taskController.getTaskSessions(req, res));
    router.post("/", authMiddleware,(req, res) => taskController.createTaskSession(req, res));
    router.put("/", authMiddleware,(req, res) => taskController.updateTaskSession(req, res));
    router.put('/upload/:id', upload.array('files', 3),(req, res) => taskController.uploadImageTaskSession(req, res));
    return router;
}