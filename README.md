LetsChat

A full-stack real-time messaging application built with Node.js, Express, MongoDB, and Socket.IO, enabling secure and scalable communication.

Overview

LetsChat is a real-time chat platform designed using a client-server architecture. It integrates RESTful APIs with WebSocket-based communication to deliver low-latency messaging, secure authentication, and efficient data handling.

Features
Real-time messaging using Socket.IO
JWT-based authentication and authorization
One-to-one private conversations
Media upload support via Cloudinary
User presence tracking (online/offline)
RESTful API design
Scalable and modular backend structure
Architecture

The application follows a modular client-server architecture:

Client – Handles user interface and socket connections
Server – Provides REST APIs and WebSocket services
Database – MongoDB for persistent data storage
Tech Stack

Backend

Node.js
Express.js
MongoDB (Mongoose)
Socket.IO

Services

Cloudinary (media storage)
Nodemailer (email services)
Project Structure
lets-chat/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── client/            # Frontend (if applicable)
├── config/            # Configuration files
├── .env               # Environment variables
├── package.json
└── README.md
Getting Started
Prerequisites
Node.js (v16 or higher)
MongoDB instance (local or cloud)
Installation
git clone https://github.com/rudrasinhrahevar/lets-chat.git
cd lets-chat
npm install
Running the Application
# Development
npm run dev

# Production
npm start
Environment Variables

Create a .env file in the root directory and configure the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
Scripts
Command	Description
npm run dev	Start server in development mode
npm start	Start server in production
API Overview
Method	Endpoint	Description
POST	/api/auth/register	Register a user
POST	/api/auth/login	Authenticate user
GET	/api/users	Retrieve users
POST	/api/messages	Send a message
Security
Secure HTTP headers using Helmet
Rate limiting to prevent abuse
XSS protection
MongoDB query sanitization
Token-based authentication using JWT
Deployment

The application can be deployed on platforms such as:

Render
Railway
AWS
DigitalOcean

Ensure all required environment variables are properly configured in the deployment environment.

Contributing

Contributions are welcome.

Fork the repository
Create a feature branch
Commit your changes
Submit a pull request
License

This project is licensed under the ISC License.

Author

Rudrasinh
