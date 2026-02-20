import { Schema, model, type InferSchemaType, Types } from "mongoose";

const taskSchema = new Schema(
    {
        description: { type: String, required: true, trim: true },
        assignedTo: { type: Types.ObjectId, ref: "User", required: true, index: true },
        dueTime: { type: Date, required: true },
        status: { type: String, required: true, enum: ["pending", "completed"], default: "pending" },
    },
    { timestamps: { createdAt: true, updatedAt: true } },
);

export type Task = InferSchemaType<typeof taskSchema>;
export const TaskModel = model("Task", taskSchema);
