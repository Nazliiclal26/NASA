// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { oauth2Client } = require('../config/oauth2Config');

router.get('/login', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(url);
});

router.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Store tokens as needed
    res.redirect('/somewhere-successful');
  } catch (error) {
    res.redirect('/login-error');
  }
});

module.exports = router;