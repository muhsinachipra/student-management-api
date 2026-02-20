import { Router } from "express";
import { getMyTasks, markTaskCompleted } from "../controllers/studentController";
import { authenticate } from "../middleware/authenticate";

export const studentRoutes = Router();

studentRoutes.use(authenticate);

/**
 * @swagger
 * /api/student/tasks:
 *   get:
 *     summary: Get tasks for the authenticated student
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 */
studentRoutes.get("/tasks", getMyTasks);

/**
 * @swagger
 * /api/student/tasks/{taskId}/status:
 *   patch:
 *     summary: Mark a task as completed
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: completed
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Task status updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
studentRoutes.patch("/tasks/:taskId/status", markTaskCompleted);

