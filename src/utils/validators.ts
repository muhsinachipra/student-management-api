import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const addStudentSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
    department: z.string().min(1).optional(),
});

export const assignTaskSchema = z.object({
    studentId: z.string().min(1),
    description: z.string().min(1),
    dueTime: z.coerce.date(),
});

export const updateTaskStatusSchema = z.object({
    status: z.literal("completed"),
});
