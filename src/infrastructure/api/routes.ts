import { Router } from 'express';
import { setupAuthRoute } from './routes/auth.route';
import { setupTaskRoute } from './routes/task.route';
import { setupMasterRoute } from './routes/master.route';
import { setupUserRoute } from './routes/user.route';

export const router = Router();

router.use('/auth', setupAuthRoute());
router.use('/users', setupUserRoute());
router.use('/tasks', setupTaskRoute());
router.use('/master', setupMasterRoute());