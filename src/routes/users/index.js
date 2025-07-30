import express from "express";
import {
  createUserRoute,
  deleteUserRoute,
  editUserRoute,
  getUserRoute,
  getUsersRoute
} from "../../controllers/users/index.js";
import authenticateJWT from "../../middleware/authenticateJWT.js";
import awaitHandlerFactory from "../../middleware/awaitHandlerFactory.middleware.js";
import { createUserSchema } from "../../middleware/validators/UserValidator.middleware.js";

const router = express.Router();

router.get("/", createUserSchema, authenticateJWT, awaitHandlerFactory(getUsersRoute));
router.post("/", authenticateJWT, awaitHandlerFactory(createUserRoute));
router.get("/:id", authenticateJWT, awaitHandlerFactory(getUserRoute));
router.patch("/:id", authenticateJWT, awaitHandlerFactory(editUserRoute));
router.delete("/:id", authenticateJWT, awaitHandlerFactory(deleteUserRoute));

export default router;
