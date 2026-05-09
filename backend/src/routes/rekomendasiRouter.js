import { Router } from "express";
import rekomendasiController from "../controllers/rekomendasiController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const rekomendasiRouter = Router();

// user
rekomendasiRouter.post("/", verifyToken, rekomendasiController.createRekomendasi);
rekomendasiRouter.get("/me", verifyToken, rekomendasiController.getRekomendasiByUserLogin);
rekomendasiRouter.get("/:id", verifyToken, rekomendasiController.getRekomendasiById);

// admin
rekomendasiRouter.get("/", verifyToken, verifyAdmin, rekomendasiController.getAllRekomendasi);

export default rekomendasiRouter;