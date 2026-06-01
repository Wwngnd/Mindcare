import { Router } from "express";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import authController from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const authRoute = Router();

//endpoint for public
authRoute.post("/login", validate(loginSchema), authController.Login);
authRoute.get("/token", authController.RefreshToken);
authRoute.delete('/logout', verifyToken, authController.Logout);

//endpoint for login user
authRoute.get("/me", verifyToken, authController.getUserByToken);

//endpoint admin only
authRoute.get("/users", verifyToken, verifyAdmin, authController.getAllUsers)
authRoute.get("/users/:id", verifyToken, verifyAdmin, authController.getUserById);
authRoute.delete("/users/:id", verifyToken, verifyAdmin, authController.deleteUser);

export default authRoute;