import { Router } from "express";
import { addStudent, assignTask } from "../controllers/adminController";
import { authenticate } from "../middleware/authenticate";
import { isAdmin } from "../middleware/isAdmin";

export const adminRoutes = Router();

adminRoutes.use(authenticate, isAdmin);

/**
 * @swagger
 * /api/admin/add-student:
 *   post:
 *     summary: Add a new student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Student'
 *             required:
 *               - name
 *               - email
 *               - department
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
adminRoutes.post("/add-student", addStudent);

/**
 * @swagger
 * /api/admin/assign-task:
 *   post:
 *     summary: Assign a task to a student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               description:
 *                 type: string
 *               dueTime:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - studentId
 *               - description
 *               - dueTime
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
adminRoutes.post("/assign-task", assignTask);

