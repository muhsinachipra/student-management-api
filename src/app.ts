import express from "express";
import swaggerUi from "swagger-ui-express";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { openApiSpec } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";
import { adminRoutes } from "./routes/adminRoutes";
import { authRoutes } from "./routes/authRoutes";
import { studentRoutes } from "./routes/studentRoutes";

async function bootstrap() {
    await connectDb();

    const app = express();

    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/student", studentRoutes);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

    app.use(errorHandler);

    app.listen(env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on port ${env.PORT}`);
    });
}

void bootstrap();
