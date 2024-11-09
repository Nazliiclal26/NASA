// controllers/calendarController.js
const { google } = require('googleapis');

// Function to add a calendar event
const addCalendarEvent = async (eventData, tokens) => {
  const calendar = google.calendar({ version: 'v3', auth: tokens });
  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventData,
    });
    return event.data;
  } catch (error) {
    console.error('Failed to add calendar event:', error);
    throw error;
  }
};

// Function to update a calendar event
const updateCalendarEvent = async (eventId, eventData, tokens) => {
  const calendar = google.calendar({ version: 'v3', auth: tokens });
  try {
    const event = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: eventData,
    });
    return event.data;
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    throw error;
  }
};

// Function to delete a calendar event
const deleteCalendarEvent = async (eventId, tokens) => {
  const calendar = google.calendar({ version: 'v3', auth: tokens });
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return { message: 'Event deleted successfully' };
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    throw error;
  }
};

// Function to retrieve calendar events
const getCalendarEvents = async (tokens) => {
  const calendar = google.calendar({ version: 'v3', auth: tokens });
  try {
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    return result.data.items;
  } catch (error) {
    console.error('Failed to get calendar events:', error);
    throw error;
  }
};

module.exports = {
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
};