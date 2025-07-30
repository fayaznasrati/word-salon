import express from "express";
import passport from "passport";
import {
  createLog,
  deleteLog,
  editLog,
  getLog,
  getLogs,
} from "../../services/logging/index.js";

const router = express.Router();

// Get all logs
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      await getLogs(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Create a log
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      await createLog(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific log by ID
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      await getLog(req, res);
    } catch (error) {
      next(error);
    }
  }
);



export default router;
