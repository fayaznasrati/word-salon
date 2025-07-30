import userRoutes from './users';
import agentsRoutes from './agents';
import agencyRoutes from './agency';
import meRoutes from './me';
import authRoutes from './auth';
import roleRoutes from './roles';
import uploadRoutes from './uploads';
import permissionRoutes from './permissions';
import imageRoutes from './images';
import express from "express";


const router = express.Router();

router.use("/", authRoutes);
router.use("/me", meRoutes);
router.use("/uploads", uploadRoutes);
router.use("/users", userRoutes);
router.use("/agents", agentsRoutes);
router.use("/agency", agencyRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/public/images", imageRoutes);


export default router;
