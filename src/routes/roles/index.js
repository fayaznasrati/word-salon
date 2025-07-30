import express from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import { getProfileRouteHandler, patchProfileRouteHandler } from "../../controllers/me/index.js";
import { getPermissionsRoute } from "../../controllers/permissions/index.js";
import { getRolesRoute, getRoleRoute, deleteRoleRoute, createRoleRoute, editRoleRoute } from "../../controllers/roles/index.js";

const router = express.Router();

// get user's profile
router.get("/", passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    getProfileRouteHandler(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// update user's profile
router.patch("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await patchProfileRouteHandler(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// get permissions
router.get("/permissions", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await getPermissionsRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// get all roles
router.get("/roles", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await getRolesRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// create a role
router.post("/roles", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await createRoleRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// get a specific role
router.get("/roles/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await getRoleRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// edit a role
router.patch("/roles/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await editRoleRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// delete a role
router.delete("/roles/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await deleteRoleRoute(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;
