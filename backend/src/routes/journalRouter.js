import { Router } from "express";
import journalController from "../controllers/journalController.js";
import { validate } from "../middleware/validate.js";
import { journalSchema } from "../validations/journalValidation.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const journalRouter = Router();


// endpoint for users
journalRouter.post("/", verifyToken, validate(journalSchema), journalController.createJournal);
journalRouter.get("/me", verifyToken, journalController.getAllJournalByUserLogin);
journalRouter.put("/:id", verifyToken, validate(journalSchema), journalController.updateJournal);
journalRouter.delete("/:id", verifyToken, journalController.deleteJournal);

// endpoint admin only
journalRouter.get("/", verifyToken, verifyAdmin, journalController.getAllJournal);
journalRouter.get("/:id", verifyToken, verifyAdmin, journalController.getJournalById);

export default journalRouter;