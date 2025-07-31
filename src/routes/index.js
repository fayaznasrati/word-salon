
import userRoutes from './user/index.js';
import authRoutes from './auth/index.js';
import eventsRoutes from './event/index.js';
import express from "express";


const router = express.Router();

router.use("/", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventsRoutes);


export default router;
