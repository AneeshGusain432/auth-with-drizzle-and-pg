import express from "express";
import type { Express } from "express";

export function createExpressApplication(): Express {
  const app = express();

  //   middleware

  // routes

  app.get("/", (req, res) => {
    return res.json({message: "hello from express server"})
  })

  return app;
}
