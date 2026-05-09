import { Router } from "express";
import lariController from "../controllers/lariController.js";
import { validate } from "../middleware/validate.js";
import { lariSchema } from "../validations/lariValidation.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const lariRouter = Router();

//endpoint for  user
lariRouter.post("/", verifyToken, validate(lariSchema), lariController.createLari);
lariRouter.get("/me", verifyToken, lariController.getAllLariByUserLogin);
lariRouter.get("/statistik", verifyToken, lariController.getStatistikLari);
lariRouter.get("/:id", verifyToken, lariController.getLariById);
lariRouter.delete("/:id", verifyToken, lariController.deleteLari);

// endpoint admin only
lariRouter.get("/", verifyToken, verifyAdmin, lariController.getAllLari);

export default lariRouter;