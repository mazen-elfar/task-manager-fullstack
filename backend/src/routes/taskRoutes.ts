import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Apply authentication middleware to all task endpoints
router.use(authenticateUser);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;
