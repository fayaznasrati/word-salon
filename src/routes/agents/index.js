import express from "express";
import passport from "passport";
import {
  createAgent,
  deleteAgent,
  editAgent,
  getAgent,
  getAgents
} from "../../services/agents";

const router = express.Router();

// Get all agents
router.get("/", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await getAgents(req, res);
  } catch (error) {
    next(error);
  }
});

// Create a user
router.post("/", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await createAgent(req, res);
  } catch (error) {
    next(error);
  }
});

// Get a specific user
router.get("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await getAgent(req, res);
  } catch (error) {
    next(error);
  }
});

// Edit a user
router.patch("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await editAgent(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete a user
router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await deleteAgent
(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
