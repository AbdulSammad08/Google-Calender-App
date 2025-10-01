Project Overview
This is a full-stack web application designed to interact with Google Calendar and Google Tasks. It allows users to authenticate with their Google account and then create new calendar events and tasks directly from a simple web interface.

The project is structured as a monorepo with two main parts:

client/: A React-based frontend application that provides the user interface.
server/: A Node.js and Express-based backend that handles authentication and communication with the Google APIs.
Frontend (client/)
The frontend is a single-page application (SPA) built with React.

App.js: This is the root component. It renders the main Dashboard.
components/Dashboard.js: This is the main UI component. It contains:
A "Sign in with Google" button that initiates the authentication process by redirecting the user to the backend's authentication endpoint (/auth/google).
The CreateEventForm and CreateTaskForm components, which are displayed on the dashboard.
components/CreateEventForm.js: This component provides a form to create a new Google Calendar event. It includes fields for title, description, start time, and end time. When the user submits the form, it sends a POST request to the backend API endpoint (/api/calendar/create-event) with the event details.
components/CreateTaskForm.js: This component provides a form to create a new Google Task. It includes fields for title, notes, and an optional due date. When submitted, it sends a POST request to the backend API endpoint (/api/tasks/create-task).
Backend (server/)
The backend is a Node.js application using the Express web framework. Its primary responsibilities are handling user authentication and interacting with the Google APIs.

index.js: This is the main entry point for the server. It sets up the Express application, middleware, and all the API routes.
Dependencies:
express: The web server framework.
googleapis: The official Google API client library for Node.js, used to interact with Google Calendar and Google Tasks.
express-session: To manage user sessions and store authentication tokens.
cors: To enable Cross-Origin Resource Sharing, allowing the frontend (running on a different port) to communicate with the backend.
dotenv: To manage environment variables for sensitive information like API keys.
Authentication Flow (OAuth 2.0)
The application uses Google's OAuth 2.0 protocol to get the user's permission to manage their calendar and tasks.

The user clicks the "Sign in with Google" button on the frontend, which redirects them to the backend's /auth/google route.
The backend, using the googleapis library, generates a unique authentication URL and redirects the user to Google's consent screen.
The user signs in with their Google account and grants the requested permissions (to manage calendar events and tasks).
Google redirects the user back to the backend at the /auth/google/callback URL, providing an authorization code.
The backend exchanges this code for an access token and a refresh token. These tokens are then stored in the user's session.
The user is redirected back to the frontend application, now in an authenticated state.
API Endpoints
The backend exposes the following API endpoints:

POST /api/calendar/create-event:
This is a protected route that requires the user to be authenticated.
It receives the event details (title, description, start/end times) in the request body.
It uses the access token from the user's session to make an authenticated request to the Google Calendar API to create the event.
POST /api/tasks/create-task:
This is also a protected route.
It receives the task details (title, notes, due date) in the request body.
It uses the access token to make an authenticated request to the Google Tasks API to create the task.
How to Run the Application
Configure Environment Variables: In the server/ directory, you would need a .env file with your GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.
Start the Backend: Run npm install and then npm start in the server/ directory.
Start the Frontend: Run npm install and then npm start in the client/ directory.
Open the Application: Open your browser to http://localhost:3000 to use the application.
