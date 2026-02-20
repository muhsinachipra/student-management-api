import bcrypt from "bcrypt";
import { UserModel } from "../models/User";
import { env } from "./env";

export async function seedAdmin(): Promise<void> {
  try {
    const existingAdmin = await UserModel.findOne({ role: "admin" }).lean();
    if (existingAdmin) return;

    const hashedPassword = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, 10);

    try {
      await UserModel.create({
        name: "Super Admin",
        email: env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        department: "Administration",
      });

      // eslint-disable-next-line no-console
      console.log(
        `Seeded default admin user (${env.DEFAULT_ADMIN_EMAIL}). Please change these credentials immediately in production.`,
      );
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error?.code === 11000 || error?.name === "MongoServerError") {
        // eslint-disable-next-line no-console
        console.log("Admin user already exists, skipping seed.");
        return;
      }
      throw error;
    }
  } catch (error) {
    // Log error but don't crash - seeding failure shouldn't prevent server startup
    // eslint-disable-next-line no-console
    console.error("Failed to seed admin user:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
