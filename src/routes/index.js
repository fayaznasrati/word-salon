import userRoutes from './users/index.js';
import meRoutes from './me/index.js';
import authRoutes from './auth/index.js';
import roleRoutes from './roles/index.js';
import uploadRoutes from './uploads/index.js';
import permissionRoutes from './permissions/index.js';
import imageRoutes from './images/index.js';
import express from "express";


const router = express.Router();

router.use("/", authRoutes);
router.use("/me", meRoutes);
router.use("/uploads", uploadRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/public/images", imageRoutes);


export default router;
