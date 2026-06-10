import express from "express";
import cookieParser from 'cookie-parser'
import type { Express } from "express";
import authRouter from "./module/auth/routes.js";

export function createExpressApplication(): Express {
  const app = express();
  

  // middleware
  app.use(express.json())
  app.use(cookieParser())

  // routes
  app.use("/api/auth", authRouter)

  app.get("/", (req, res) => {
    return res.json({message: "hello from express server"})
  })

  return app;
}
