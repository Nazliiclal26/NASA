// Function to create a new calendar event
function createCalendarEvent() {
    const eventData = {
      summary: prompt("Enter event title:", "New Book Group Meeting"),
      location: prompt("Enter event location:", "Library"),
      description: prompt("Enter event description:", "Discuss the next book selection."),
      start: {
        dateTime: prompt("Enter start date and time:", new Date().toISOString())
      },
      end: {
        dateTime: prompt("Enter end date and time:", new Date(new Date().getTime() + 3600000).toISOString()) // Example: +1 hour from start
      }
    };
  
    fetch('/calendar/add-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        alert('Meeting scheduled successfully');
        showEvents(); // Refresh the list of events
      } else {
        alert('Failed to schedule meeting: ' + data.message);
      }
    })
    .catch(error => alert('Error scheduling meeting: ' + error.message));
  }
  
  // Function to display all calendar events
  function showCalendarEvents() {
    fetch('/calendar/events')
    .then(response => response.json())
    .then(data => {
      const eventsContainer = document.getElementById('calendarEvents');
      eventsContainer.innerHTML = '';
      if(data.success && data.events.length > 0) {
        data.events.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.className = 'event-card';
          eventDiv.innerHTML = `<strong>${event.summary}</strong> - ${event.start.dateTime} to ${event.end.dateTime}<br>
                                <button onclick="updateEvent('${event.id}')">Edit</button>
                                <button onclick="deleteEvent('${event.id}')">Delete</button>`;
          eventsContainer.appendChild(eventDiv);
        });
      } else {
        eventsContainer.innerHTML = '<p>No upcoming events found.</p>';
      }
    })
    .catch(error => alert('Error fetching meetings: ' + error.message));
  }
  
  // Function to update an existing calendar event
  function updateEvent(eventId) {
    const eventData = {
      summary: prompt("Update event title:", "Updated Book Group Meeting"),
      location: prompt("Update event location:", "Updated Location"),
      description: prompt("Update event description:", "Updated discussion topics."),
      start: {
        dateTime: prompt("Update start date and time:", new Date().toISOString())
      },
      end: {
        dateTime: prompt("Update end date and time:", new Date(new Date().getTime() + 3600000).toISOString())
      }
    };
  
    fetch(`/calendar/update-event/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        alert('Event updated successfully');
        showEvents(); // Refresh the list of events
      } else {
        alert('Failed to update event: ' + data.message);
      }
    })
    .catch(error => alert('Error updating event: ' + error.message));
  }
  
  // Function to delete a calendar event
  function deleteEvent(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
      fetch(`/calendar/delete-event/${eventId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          alert('Event deleted successfully');
          showEvents(); // Refresh the list of events
        } else {
          alert('Failed to delete event: ' + data.message);
        }
      })
      .catch(error => alert('Error deleting event: ' + error.message));
    }
  }  