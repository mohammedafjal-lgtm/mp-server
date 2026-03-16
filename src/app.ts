import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "@/config/zodOpenApi";
import { authRoutes } from "@/features/auth/auth.routes";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { errorHandler } from "@/middleware/errorHandler";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use("/api/v1/auth", authRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/docs", openAPIRouter);

app.use(errorHandler);

export { app };
