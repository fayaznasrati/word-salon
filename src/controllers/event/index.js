import { Event, Invitation, User } from '../models/index.js';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const createEvent = async (req, res) => {
  try {
    const { topic, description, startDateTime, endDateTime, zoomLink, invitees } = req.body;
    
    // Create the event
    const event = await Event.create({
      topic,
      description,
      startDateTime,
      endDateTime,
      zoomLink,
      createdBy: req.user.id
    });

    // Create invitations and send emails
    const invitations = await Promise.all(invitees.map(async (userId) => {
      const invitation = await Invitation.create({
        eventId: event.id,
        userId,
      });
      
      const user = await User.findByPk(userId);
      const responseToken = uuidv4();
      
      // In a real app, store this token in the database with expiration
      const responseLink = `${process.env.FRONTEND_URL}/rsvp?token=${responseToken}&invitation=${invitation.id}`;
      
      await transporter.sendMail({
        from: `"Event Portal" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Invitation: ${event.topic}`,
        html: `
          <h1>You're invited to ${event.topic}</h1>
          <p>${event.description}</p>
          <p><strong>When:</strong> ${new Date(event.startDateTime).toLocaleString()}</p>
          <p><strong>Zoom Link:</strong> <a href="${event.zoomLink}">Join Meeting</a></p>
          <div>
            <a href="${responseLink}&response=ACCEPTED" style="background: green; color: white; padding: 10px; margin: 5px; text-decoration: none;">Accept</a>
            <a href="${responseLink}&response=DECLINED" style="background: red; color: white; padding: 10px; margin: 5px; text-decoration: none;">Decline</a>
            <a href="${responseLink}&response=MAYBE" style="background: orange; color: white; padding: 10px; margin: 5px; text-decoration: none;">Maybe</a>
          </div>
        `,
      });
      
      return invitation;
    }));

    res.status(201).json({ event, invitations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const { invitationId, response } = req.body;
    
    const invitation = await Invitation.findByPk(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    invitation.status = response;
    invitation.responseDate = new Date();
    await invitation.save();
    
    res.json({ message: 'Response recorded', invitation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventWithResponses = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          through: {
            model: Invitation,
            attributes: ['status', 'responseDate']
          },
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};