import express from "express";

import authRoute from "./authRouter.js";
import usersRouter from "./usersRouter.js";
import journalRouter from "./journalRouter.js";
import kuesionerRouter from "./kuesionerRouter.js";
import olahragaRouter from "./olahragaRouter.js";
import stressScanRouter from "./stressScanRouter.js";
import stressProgressRouter from "./stressProgressRouter.js";
import bookRouter from "./bookRouter.js";
import matchRouteRouter from "./matchRouteRouter.js";

const router = express.Router();

const routes = [
    { path: "/auth", handler: authRoute },
    { path: "/users", handler: usersRouter },
    { path: "/journal", handler: journalRouter },
    { path: "/kuesioner", handler: kuesionerRouter },
    { path: "/olahraga", handler: olahragaRouter },
    { path: "/stress-scan", handler: stressScanRouter },
    { path: "/stress-progress", handler: stressProgressRouter },
    { path: "/books", handler: bookRouter },
    { path: "/match-route", handler: matchRouteRouter },
];

routes.forEach(({ path, handler }) => router.use(path, handler));

export default router;
