import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { registerSchema, updateProfileSchema } from "../validations/authValidation.js";
import usersController from "../controllers/usersController.js";
import verifyToken from "../middleware/VerifyToken.js";

const usersRouter = Router();

// public
usersRouter.post("/register", validate(registerSchema), usersController.Register);

// user login
usersRouter.put("/me",    verifyToken, validate(updateProfileSchema), usersController.updateProfile);
usersRouter.delete("/me", verifyToken, usersController.deleteAccount);

export default usersRouter;