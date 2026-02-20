import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { TaskModel } from "../models/Task";
import { UserModel } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { addStudentSchema, assignTaskSchema } from "../utils/validators";

export const addStudent = asyncHandler(async (req, res) => {
  const { name, email, password, department } = addStudentSchema.parse(req.body);

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) throw new HttpError(409, "Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  const student = await UserModel.create({
    name,
    email,
    password: hashed,
    role: "student",
    department: department ?? null,
  } as any);

  return res.status(201).json({ student });
});

export const assignTask = asyncHandler(async (req, res) => {
  const { studentId, description, dueTime } = assignTaskSchema.parse(req.body);

  if (!Types.ObjectId.isValid(studentId)) throw new HttpError(400, "Invalid studentId");

  const student = await UserModel.findById(studentId).lean();
  if (!student) throw new HttpError(404, "Student not found");
  if (student.role !== "student") throw new HttpError(400, "assigned user must be a student");

  const task = await TaskModel.create({
    description,
    assignedTo: student._id,
    dueTime,
    status: "pending",
  });

  return res.status(201).json({ task });
});

