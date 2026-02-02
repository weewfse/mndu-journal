require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Static serve uploads
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));

// Optionally serve frontend (uncomment if needed)
// app.use(express.static(path.join(__dirname, '../')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
