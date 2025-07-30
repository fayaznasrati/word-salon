import express from "express";
import {
  forgotPasswordRouteHandler,
  loginRouteHandler,
  registerRouteHandler,
  resetPasswordRouteHandler,
} from "../../services/auth/index.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  console.log("req.body",req.body)
  try {
    const { email, password } = req.body;
    await loginRouteHandler(req, res, email, password);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  return res.sendStatus(204);
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    await registerRouteHandler(req, res, name, email, password);
  } catch (error) {
    next(error);
  }
 });

router.post("/password-forgot", async (req, res, next) => {
  try {
    const { email } = req.body;
    await forgotPasswordRouteHandler(req, res, email);
  } catch (error) {
    next(error);
  }
});

router.post("/password-reset", async (req, res, next) => {
  try {
    await resetPasswordRouteHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
