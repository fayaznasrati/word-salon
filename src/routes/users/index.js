import express from "express";
import passport from "passport";
import {
  createUserRoute,
  deleteUserRoute,
  editUserRoute,
  getUserRoute,
  getUsersRoute
} from "../../services/users/index.js";

const router = express.Router();

// Get all users
router.get("/", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await getUsersRoute(req, res);
  } catch (error) {
    next(error);
  }
});

// Create a user
router.post("/", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await createUserRoute(req, res);
  } catch (error) {
    next(error);
  }
});

// Get a specific user
router.get("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await getUserRoute(req, res);
  } catch (error) {
    next(error);
  }
});

// Edit a user
router.patch("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await editUserRoute(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete a user
router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    await deleteUserRoute(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
