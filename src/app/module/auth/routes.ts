import { Router } from "express";
import { login, logout, register } from "./controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";

const authRouter: Router = Router();

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", authenticate, logout)

export default authRouter;
