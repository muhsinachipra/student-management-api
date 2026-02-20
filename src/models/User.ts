import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ["admin", "student"] },
    department: { type: String, required: false, trim: true },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    if ("password" in ret) {
      delete (ret as { password?: string }).password;
    }
    return ret;
  },
});

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);

