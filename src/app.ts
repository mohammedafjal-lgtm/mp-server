import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRoutes } from "@/features/auth/auth.routes";
import { errorHandler } from "@/middleware/errorHandler";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);



app.get("/health", (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

export { app };
