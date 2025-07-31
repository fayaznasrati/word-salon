import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
} from "../../controllers/user/index.js";
import { uploadPhoto } from "../../middleware/upload.js";
import authenticateJWT from "../../middleware/authenticateJWT.js";
import awaitHandlerFactory from "../../middleware/awaitHandlerFactory.middleware.js";
import {
  updateProfileValidator,
  updatePasswordValidator
} from "../../middleware/validators/userValidator.middleware.js";

const router = express.Router();

router.get("/me", authenticateJWT, awaitHandlerFactory(getMyProfile));

router.patch("/me/update", authenticateJWT, updateProfileValidator,uploadPhoto, awaitHandlerFactory(updateMyProfile));

router.patch("/me/password", authenticateJWT, updatePasswordValidator, awaitHandlerFactory(updateMyPassword));

export default router;
