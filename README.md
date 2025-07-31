Project: Event Invitation System (Backend)
==========================================

Description:
------------
This is a backend application built using Node.js and Express, with PostgreSQL as the database. It manages users, events, invitations, and attendance tracking. The system supports user authentication, file uploads, and integrates with Zoom.

Key Technologies:
-----------------
- Node.js
- Express.js
- PostgreSQL
- Sequelize (ORM)
- Passport.js (Authentication)
- JWT (Authorization)
- Multer (File Uploads)
- Zoom API (Integration)

Project Structure:
------------------
.
├── config                  # Sequelize config file (database settings)
├── migrations              # Sequelize migration files for DB schema
├── models                  # Sequelize models (User, Event, Invitation, Attendance)
├── seeders                 # Sequelize seeders for initial data (e.g., test users)
├── src
│   ├── controllers         # Route handlers for auth, user, event, uploads, etc.
│   ├── landing             # Static landing page (optional)
│   ├── middleware          # JWT auth, request validators, file upload config
│   ├── passport.js         # Passport strategy configuration
│   ├── routes              # Express route definitions
│   ├── sequelize           # Sequelize instance configuration
│   ├── server.js           # App entry point (starts the Express server)
│   ├── services            # Custom services (e.g., Zoom integration)
│   ├── test.js             # Temporary or manual test script
│   └── utils               # Utility functions (e.g., custom logging)
├── uploads                 # Uploaded files (e.g., profile photos)
├── ecosystem.config.json  # PM2 process manager config
├── package.json            # Project metadata and dependencies
├── CHANGELOG.md            # Log of changes
├── README.md               # Project documentation

Setup Instructions:
-------------------
1. Clone the repository:
   git clone <your-repo-url>

2. Install dependencies:
   npm install

3. Configure environment:
   - Copy `.env.example` to `.env` (if available)
   - Set DB credentials and JWT secrets

4. Setup the database:
   - Create the database manually (e.g., `event_system_db`)
   - Run migrations:
     npx sequelize-cli db:migrate
   - (Optional) Seed initial data:
     npx sequelize-cli db:seed:all

5. Start the server:
   npm run dev   # Uses nodemon for development
   OR
   npm start     # For production

Useful Scripts:
---------------
- `npm run dev`: Start in development mode with live reload
- `npm start`: Start in production mode
- `npx sequelize-cli db:migrate`: Apply DB migrations
- `npx sequelize-cli db:seed:all`: Seed DB with test data

Notes:
------
- Uploaded profile photos are stored in `/uploads/profile-photos`.
- JWT is used for API authentication.
- The app supports event invitations with accept, reject, or maybe responses.
- Zoom integration is handled in `zoomService.js`.

Author:
-------
Fayaz Nasrati
