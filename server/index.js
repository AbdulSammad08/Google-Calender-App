const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // secure:true requires HTTPS
}));

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // e.g. http://localhost:5000/auth/google/callback
);

// minimal scopes to create events and tasks
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'openid', 'email'
];

// 1) Start the OAuth flow (user -> Google)
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // asks for refresh_token
    scope: SCOPES,
    prompt: 'consent' // force consent to get refresh_token on repeat testing
  });
  res.redirect(url);
});

// 2) OAuth callback (Google -> this endpoint)
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // store tokens in session (demo). For production: persist to DB linked to user.
    req.session.tokens = tokens;
    res.redirect(CLIENT_URL + '/?auth=success');
  } catch (err) {
    console.error('Auth error', err);
    res.status(500).send('Authentication failed');
  }
});

// Helper: ensure logged in
function ensureAuth(req, res, next) {
  if (!req.session.tokens) return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  oauth2Client.setCredentials(req.session.tokens);
  next();
}

// 3) API to create calendar event
app.post('/api/calendar/create-event', ensureAuth, async (req, res) => {
  /*
    expected body:
    { title, description, start, end, timezone }
    where start/end are ISO timestamps (e.g., 2025-08-18T10:00:00.000Z)
  */
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const { title, description, start, end, timezone } = req.body;
  const event = {
    summary: title,
    description,
    start: { dateTime: start, timeZone: timezone || 'UTC' },
    end: { dateTime: end, timeZone: timezone || 'UTC' }
  };
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });
    // store any refreshed tokens back to session
    req.session.tokens = oauth2Client.credentials;
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4) API to create a task
app.post('/api/tasks/create-task', ensureAuth, async (req, res) => {
  // expected body: { title, notes, due } where due is ISO or omitted
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  const { title, notes, due } = req.body;
  const task = { title };
  if (notes) task.notes = notes;
  if (due) task.due = new Date(due).toISOString();
  try {
    const result = await tasks.tasks.insert({
      tasklist: '@default',
      requestBody: task
    });
    req.session.tokens = oauth2Client.credentials;
    res.json(result.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));