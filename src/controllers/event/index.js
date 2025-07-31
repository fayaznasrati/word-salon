import { DataTypes, Op, } from "sequelize";
import sequelize from '../../sequelize/index.js';

import { v4 as uuidv4 } from 'uuid';
import db from '../../../models/index.js';
const { Event, User} = db;
import { createZoomMeeting } from '../../services/zoomService.js';


const generateZoomLink = async (topic, startDateTime, endDateTime) => {
  // Validate inputs first
  if (!topic || !startDateTime || !endDateTime) {
    throw new Error("Missing required meeting details");
  }

  try {
    const zoomMeetingDetails = await createZoomMeeting({
      topic: topic.substring(0, 200), // Zoom limits topic to 200 chars
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString()
    });
    
    return zoomMeetingDetails.zoomLink;

  } catch (error) {
    console.error("Failed to create Zoom meeting:", error.message);
    
    // Fallback to a  mock link
    const meetingId = Math.random().toString(36).substring(2, 12);
    const password = Math.random().toString(36).substring(2, 10);
    
    return `https://zoom.us/j/${meetingId}?pwd=${password}`;
  }
};
export const createEvent = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start transaction

  try {
    const { 
      topic, 
      description, 
      startDateTime, 
      endDateTime, 
    } = req.body;
    
     // Create Zoom meeting
    const finalZoomLink = await generateZoomLink(topic, startDateTime, endDateTime);

    const event = await Event.create({
      id: uuidv4(),
      topic,
      description,
      startDateTime,
      endDateTime,
      zoomLink: finalZoomLink,
      status: 'UPCOMING',
      createdBy: req.user.id
    }, { transaction });
    await transaction.commit();
    return res.status(201).json({
      success: true,
      event: {
        ...event.get({ plain: true }),
      }
    });

  }  catch (error) {
  await transaction.rollback();
    console.error("Error creating event:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to creating events",
      details: error.message 
    });
}
};

export const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const sortBy = req.query.sortBy || 'startDateTime';
    const sortOrder = req.query.sortOrder || 'ASC';

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.fromDate) where.startDateTime = { [Op.gte]: new Date(req.query.fromDate) };
    if (req.query.toDate) where.endDateTime = { [Op.lte]: new Date(req.query.toDate) };

    const { count, rows: events } = await Event.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: User,
          as: 'organizer', // This must match your Event model association
          attributes: ['id', 'name', 'phone', 'email']
        }
      ]
    });

    const totalPages = Math.ceil(count / pageSize);

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize
      }
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch events",
      details: error.message 
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    // Get the authenticated user's ID
    const userId = req.user.id;

    // Get pagination parameters from query (default to page 1, 10 items per page)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Get sorting parameters
    const sortBy = req.query.sortBy || 'startDateTime';
    const sortOrder = req.query.sortOrder || 'ASC';

    // Build where clause for filtering
    const where = {
      [Op.or]: [
        { createdBy: userId }, // Events created by the user
      ]
    };

    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.fromDate) {
      where.startDateTime = {
        [Op.gte]: new Date(req.query.fromDate)
      };
    }
    if (req.query.toDate) {
      where.endDateTime = {
        [Op.lte]: new Date(req.query.toDate)
      };
    }

    // Query the database
    const { count, rows: events } = await Event.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email']
        }
      ],
      distinct: true // Important for correct count when using includes
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / pageSize);

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize
      }
    });

  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch user events",
      details: error.message 
    });
  }
};