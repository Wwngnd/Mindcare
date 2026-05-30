import { Router } from "express";
import kuesionerController from "../controllers/kuesionerController.js";
import { validate } from "../middleware/validate.js";
import { kuesionerSchema } from "../validations/kuesionerValidation.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const kuesionerRouter = Router();

//endpoint for user
kuesionerRouter.post("/", verifyToken, validate(kuesionerSchema), kuesionerController.createKuesioner);
kuesionerRouter.get("/rekomendasi", verifyToken, kuesionerController.getAllRekomendasiByUserLogin);
kuesionerRouter.get("/rekomendasi/:sesiId", verifyToken, kuesionerController.getRekomendasiBySesiId);
kuesionerRouter.get("/me", verifyToken, kuesionerController.getAllKuesionerByUserLogin);
kuesionerRouter.delete("/:id", verifyToken, kuesionerController.deleteKuesioner);

//endpoint admin only
kuesionerRouter.get("/all", verifyToken, verifyAdmin, kuesionerController.getAllKuesioner);
kuesionerRouter.get("/all/:id", verifyToken, verifyAdmin, kuesionerController.getKuesionerById);

export default kuesionerRouter;
