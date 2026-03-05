import "dotenv/config";
import { app } from "@/app";
import { connectDB } from "@/config/database";
import logger from "@/utils/logger";

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`🚀🚀🚀 Server is running on http://localhost:${PORT}`);
  });
}

startServer();
