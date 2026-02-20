import { Types } from "mongoose";
import { TaskModel } from "../models/Task";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { updateTaskStatusSchema } from "../utils/validators";

export const getMyTasks = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");

  const tasks = await TaskModel.find({ assignedTo: req.user.sub }).lean();
  const now = Date.now();

  const tasksWithStatus = tasks.map((t) => {
    let displayStatus: "pending" | "completed" | "overdue" = t.status;
    if (t.status === "pending" && new Date(t.dueTime).getTime() < now) displayStatus = "overdue";
    return { ...t, status: displayStatus };
  });

  return res.json({ tasks: tasksWithStatus });
});

export const markTaskCompleted = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");

  const taskId = String(req.params.taskId ?? "");
  if (!Types.ObjectId.isValid(taskId)) throw new HttpError(400, "Invalid taskId");

  updateTaskStatusSchema.parse(req.body); // only allows "completed"

  const task = await TaskModel.findById(taskId);
  if (!task) throw new HttpError(404, "Task not found");
  if (String(task.assignedTo) !== req.user.sub) throw new HttpError(403, "Forbidden");

  task.status = "completed";
  await task.save();

  return res.json({ task });
});

