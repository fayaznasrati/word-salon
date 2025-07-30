
import userRoutes from './user/index.js';
import authRoutes from './auth/index.js';
import express from "express";


const router = express.Router();

router.use("/", authRoutes);
router.use("/users", userRoutes);


export default router;
