import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;
const ZOOM_USER_ID = process.env.ZOOM_USER_ID; // The Zoom account user ID hosting meetings

const zoomClient = axios.create({
  baseURL: 'https://api.zoom.us/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate JWT token for Zoom API
const generateZoomToken = () => {
  const jwt = require('jsonwebtoken');
  const payload = {
    iss: ZOOM_API_KEY,
    exp: ((new Date()).getTime() + 5000),
  };
  return jwt.sign(payload, ZOOM_API_SECRET);
};

// Create a Zoom meeting
export const createZoomMeeting = async (eventDetails) => {
  try {
    const token = generateZoomToken();
    
    const response = await zoomClient.post(`/users/${ZOOM_USER_ID}/meetings`, {
      topic: eventDetails.topic,
      type: 2, // Scheduled meeting
      start_time: new Date(eventDetails.startDateTime).toISOString(),
      duration: Math.ceil((new Date(eventDetails.endDateTime) - new Date(eventDetails.startDateTime)) / (1000 * 60)), // in minutes
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      password: Math.random().toString(36).substring(2, 8), // Random 6-character password
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      zoomLink: response.data.join_url,
      zoomMeetingId: response.data.id,
      zoomPassword: response.data.password,
    };
  } catch (error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    throw new Error('Failed to create Zoom meeting');
  }
};