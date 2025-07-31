import express from 'express';
import { createEvent, respondToInvitation, getEventWithResponses } from '../controllers/eventController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Admin creates event and sends invitations
router.post('/', authMiddleware, adminMiddleware, createEvent);

// User responds to invitation
router.post('/:eventId/respond', authMiddleware, respondToInvitation);

// Get event details with RSVP statuses
router.get('/:eventId', authMiddleware, getEventWithResponses);

export default router;