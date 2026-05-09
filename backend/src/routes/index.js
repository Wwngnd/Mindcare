import express from "express";
import authRoute from "./authRouter.js";
import usersRouter from "./usersRouter.js";
import journalRouter from "./journalRouter.js";
import kuesionerRouter from "./kuesionerRouter.js";
import lariRouter from "./lariRouter.js";
import stressScanRouter from "./stressScanRouter.js";
import rekomendasiRouter from "./rekomendasiRouter.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/users", usersRouter);
router.use("/journal", journalRouter);
router.use("/kuesioner", kuesionerRouter);
router.use("/lari", lariRouter);
router.use("/stress-scan", stressScanRouter);
router.use("/rekomendasi", rekomendasiRouter);

export default router;