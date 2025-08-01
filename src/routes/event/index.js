import express from 'express';
import { createEvent,getAllEvents,getMyEvents } from '../../controllers/event/index.js';
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
router.get('/my-events', authenticateJWT,   awaitHandlerFactory(getMyEvents));


export default router;