import { Router } from "express";
import matchRouteController from "../controllers/matchRouteController.js";
import verifyToken from "../middleware/verifyToken.js";

const matchRouteRouter = Router();

// POST /api/match-route
// Body: { coords: [{lat, lng}, ...] }
matchRouteRouter.post("/", verifyToken, matchRouteController.matchRoute);

export default matchRouteRouter;
