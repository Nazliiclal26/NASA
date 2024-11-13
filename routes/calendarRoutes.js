// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const {
  addCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent
} = require('../controllers/calendarController');

// Middleware to check if the user is authenticated and has tokens
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  next();
};

// Route to add a calendar event
router.post('/add-event', isAuthenticated, async (req, res) => {
  try {
    const event = await addCalendarEvent(req.body, req.session.tokens);
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to update a calendar event
router.put('/update-event/:eventId', isAuthenticated, async (req, res) => {
  try {
    const updatedEvent = await updateCalendarEvent(req.params.eventId, req.body, req.session.tokens);
    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to delete a calendar event
router.delete('/delete-event/:eventId', isAuthenticated, async (req, res) => {
  try {
    const result = await deleteCalendarEvent(req.params.eventId, req.session.tokens);
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to list calendar events
router.get('/events', isAuthenticated, async (req, res) => {
  try {
    const events = await getCalendarEvents(req.session.tokens);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
