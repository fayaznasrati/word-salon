
import sequelize from '../../sequelize/index.js';
import { v4 as uuidv4 } from 'uuid';
import db from '../../../models/index.js';
const { Event, User} = db;


// Helper: Mock Zoom link generator
const generateZoomLink = async (startDateTime,endDateTime) => {
  const meetingId = Math.random().toString(36).substring(2, 10);
  return `https://zoom.us/j/${meetingId}?pwd=${startDateTime}-${endDateTime}`;
}

export const createEvent = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start transaction

  try {
    const { 
      topic, 
      description, 
      startDateTime, 
      endDateTime, 
    } = req.body;
    
    const finalZoomLink = await generateZoomLink(startDateTime,endDateTime);

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
    // Get pagination parameters from query (default to page 1, 10 items per page)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Get sorting parameters
    const sortBy = req.query.sortBy || 'startDateTime';
    const sortOrder = req.query.sortOrder || 'ASC';

    // Build where clause for optional filtering
    const where = {};
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
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
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
    console.error("Error fetching events:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch events",
      details: error.message 
    });
  }
};