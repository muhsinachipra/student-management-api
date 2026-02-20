import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 chars"),
    JWT_EXPIRES_IN: z.string().default("1d"),
});

export const env = envSchema.parse(process.env);
