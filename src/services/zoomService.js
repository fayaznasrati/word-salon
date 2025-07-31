import axios from 'axios';
import dotenv from "dotenv";
import qs from 'querystring';
// import jwt from "jsonwebtoken";
dotenv.config();

// OAuth Credentials (from .env)
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

const zoomAuthClient = axios.create({
  baseURL: 'https://zoom.us',
});

const zoomApiClient = axios.create({
  baseURL: 'https://api.zoom.us/v2',
});

// Generate OAuth Access Token
const generateZoomAccessToken = async () => {
  try {
    const authString = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const response = await zoomAuthClient.post('/oauth/token', 
      qs.stringify({
        grant_type: 'account_credentials',
        account_id: ZOOM_ACCOUNT_ID
      }), {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Zoom OAuth Error:', error.response?.data || error.message);
    throw new Error('Failed to generate Zoom access token');
  }
};

// Create a Zoom Meeting (OAuth Version)
export const createZoomMeeting = async (eventDetails) => {
  try {
    const accessToken = await generateZoomAccessToken();
    
    const response = await zoomApiClient.post('/users/me/meetings', {
      topic: eventDetails.topic.substring(0, 200), // Zoom limits topics to 200 chars
      type: 2, // Scheduled meeting
      start_time: new Date(eventDetails.startDateTime).toISOString(),
      duration: Math.ceil((new Date(eventDetails.endDateTime) - new Date(eventDetails.startDateTime)) / (1000 * 60)), // Fixed: eventDetails instead of eventDates
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      password: generateMeetingPassword(),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: 'none'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      zoomLink: response.data.join_url,
      zoomMeetingId: response.data.id,
      zoomPassword: response.data.password,
      startUrl: response.data.start_url
    };
  } catch (error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create Zoom meeting');
  }
};
// Helper: Generate secure meeting password
const generateMeetingPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};