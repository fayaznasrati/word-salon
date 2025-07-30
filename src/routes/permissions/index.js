import express from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import { getProfileRouteHandler, patchProfileRouteHandler } from "../../services/me";
import { getPermissionsRoute } from "../../services/permissions";

const router = express.Router();

// get user's profile
router.get("/", passport.authenticate('jwt',{session: false}), (req, res) => {
  try {
    getProfileRouteHandler(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// update user's profile
router.patch("/", passport.authenticate('jwt',{session: false}), async (req, res) => {
  try {
    await patchProfileRouteHandler(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// get permissions
router.get("/permissions", passport.authenticate('jwt',{session: false}), async (req, res) => {
  try {
    await getPermissionsRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;