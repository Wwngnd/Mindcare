import { Router } from "express";

import stressProgressController from "../controllers/stressProgressController.js";
import verifyToken from "../middleware/verifyToken.js";

const stressProgressRouter = Router();

stressProgressRouter.get("/me", verifyToken, stressProgressController.getMyStressProgress);

export default stressProgressRouter;
