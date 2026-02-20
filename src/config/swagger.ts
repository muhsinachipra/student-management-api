import swaggerJsdoc, { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Management System",
      version: "1.0.0",
      description: "Instructions on how to use the API",
    },
    servers: [
      {
        url: "https://student-management-api-86e9.onrender.com",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Student: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "65f3d3d3d3d3d3d3d3d3d3d3",
            },
            name: {
              type: "string",
              example: "Jane Student",
            },
            email: {
              type: "string",
              format: "email",
              example: "jane@student.com",
            },
            department: {
              type: "string",
              example: "Computer Science",
            },
          },
          required: ["name", "email", "department"],
        },
        Task: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "65f3d3d3d3d3d3d3d3d3d3d4",
            },
            description: {
              type: "string",
              example: "Submit assignment",
            },
            dueTime: {
              type: "string",
              format: "date-time",
              example: "2026-02-25T18:00:00.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "overdue"],
              example: "pending",
            },
            studentId: {
              type: "string",
              example: "65f3d3d3d3d3d3d3d3d3d3d3",
            },
          },
          required: ["description", "dueTime", "status", "studentId"],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const openApiSpec = swaggerJsdoc(swaggerOptions);

