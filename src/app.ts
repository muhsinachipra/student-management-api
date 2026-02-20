import express from "express";
import swaggerUi from "swagger-ui-express";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { openApiSpec } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { adminRoutes } from "./routes/adminRoutes";
import { authRoutes } from "./routes/authRoutes";
import { studentRoutes } from "./routes/studentRoutes";
import { seedAdmin } from "./config/seed";

async function bootstrap() {
    try {
        await connectDb();
        
        try {
            await seedAdmin();
        } catch (error) {
            // Log seeding error but continue startup - non-critical
            // eslint-disable-next-line no-console
            console.error("Warning: Admin seeding failed, but continuing server startup:", error instanceof Error ? error.message : String(error));
        }

        const app = express();

        app.use(requestLogger);
        app.use(express.json());

        app.get("/health", (_req, res) => {
            res.json({ status: "ok" });
        });

        app.use("/api/auth", authRoutes);
        app.use("/api/admin", adminRoutes);
        app.use("/api/student", studentRoutes);

        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

        app.use(errorHandler);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to start server:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Unhandled error in bootstrap:", error instanceof Error ? error.message : String(error));
    process.exit(1);
});
