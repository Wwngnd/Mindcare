import { Router } from "express";
import stressScanController from "../controllers/stressScanController.js";
import { validate } from "../middleware/validate.js";
import { stressScanSchema } from "../validations/stressScanValidation.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const stressScanRouter = Router();

// user
stressScanRouter.post("/", verifyToken, validate(stressScanSchema), stressScanController.createStressScan);
stressScanRouter.get("/me", verifyToken, stressScanController.getAllStressScanByUserLogin);
stressScanRouter.get("/:id", verifyToken, stressScanController.getStressScanById);
stressScanRouter.delete("/:id", verifyToken, stressScanController.deleteStressScan);

// admin
stressScanRouter.get("/", verifyToken, verifyAdmin, stressScanController.getAllStressScan);

export default stressScanRouter;