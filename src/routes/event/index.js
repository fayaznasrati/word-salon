import express from 'express';
import { createEvent,getAllEvents } from '../../controllers/event/index.js';
import authenticateJWT from "../../middleware/authenticateJWT.js";
import {
  createEventValidator,  
  updateEventValidator,
} from "../../middleware/validators/eventValidator.middleware.js";

import awaitHandlerFactory from "../../middleware/awaitHandlerFactory.middleware.js";
const router = express.Router();

// Admin creates event and sends invitations
router.post('/', authenticateJWT, createEventValidator,  awaitHandlerFactory(createEvent));
router.get('/', authenticateJWT,   awaitHandlerFactory(getAllEvents));

// // User responds to invitation
// router.post('/:eventId/respond', authenticateJWT, awaitHandlerFactory(respondToInvitation));

// // Get event details with RSVP statuses
// router.get('/:eventId', authenticateJWT, awaitHandlerFactory(getEventWithResponses));

export default router;