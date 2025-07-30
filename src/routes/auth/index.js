// export default router;
import express from "express";
import {
  registerRouteHandler,
  loginRouteHandler,
  forgotPasswordRouteHandler,
  resetPasswordRouteHandler,
  logoutRouteHandler,
} from "../../controllers/auth/index.js";

import awaitHandlerFactory from "../../middleware/awaitHandlerFactory.middleware.js";
import authenticateJWT from "../../middleware/authenticateJWT.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../../middleware/validators/authValidator.middleware.js";

const router = express.Router();

router.post("/register", registerValidator, awaitHandlerFactory(registerRouteHandler));

router.post("/login", loginValidator, awaitHandlerFactory(loginRouteHandler));

router.post("/logout", authenticateJWT, awaitHandlerFactory(logoutRouteHandler));

router.post("/password-forgot", forgotPasswordValidator, awaitHandlerFactory(forgotPasswordRouteHandler));

router.post("/password-reset", resetPasswordValidator, awaitHandlerFactory(resetPasswordRouteHandler));

export default router;
