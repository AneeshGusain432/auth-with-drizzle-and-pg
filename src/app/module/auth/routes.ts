import { Router } from "express";
import { getMe, login, logout, register, verifyEmail } from "./controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";

const authRouter: Router = Router();

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", authenticate, logout)
authRouter.get("/get-me", authenticate, getMe)
authRouter.post("/verify-email/:token", verifyEmail) 

export default authRouter;
