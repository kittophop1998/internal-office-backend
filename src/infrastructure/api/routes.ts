import { Router } from 'express';
import { setupAuthRoute } from './routes/auth.route';
import { setupTaskRoute } from './routes/task.route';
import { setupMasterRoute } from './routes/master.route';
import { setupUserRoute } from './routes/user.route';
import { setupTaskReviewRoute } from './routes/task_review.route';
import { setupTaskSessionRoute } from './routes/task_session.route';

export const router = Router();

router.use('/auth', setupAuthRoute());
router.use('/users', setupUserRoute());
router.use('/tasks', setupTaskRoute());
router.use('/task-sessions', setupTaskSessionRoute());
router.use('/task-reviews', setupTaskReviewRoute());
router.use('/master', setupMasterRoute());