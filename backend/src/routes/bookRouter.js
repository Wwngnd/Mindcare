import { Router } from "express";

import bookController from "../controllers/bookController.js";
import verifyToken from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import { bookReadSchema, bookSessionSchema } from "../validations/bookValidation.js";

const bookRouter = Router();

bookRouter.get("/cover", bookController.proxyBookCover);
bookRouter.get("/general", verifyToken, bookController.getGeneralBooks);
bookRouter.post("/sessions", verifyToken, validate(bookSessionSchema), bookController.createBookSession);
bookRouter.get("/sessions/me", verifyToken, bookController.getAllBookSessionsByUserLogin);
bookRouter.post("/reads", verifyToken, validate(bookReadSchema), bookController.createBookRead);
bookRouter.get("/reads/me", verifyToken, bookController.getAllBookReadsByUserLogin);

export default bookRouter;
