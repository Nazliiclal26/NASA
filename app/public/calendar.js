// calendar.js

// Define an array to store events
let events = [];

// letiables to store event input fields and reminder list
let eventDateInput =
    document.getElementById("eventDate");
let eventTitleInput =
    document.getElementById("eventTitle");
let eventDescriptionInput =
    document.getElementById("eventDescription");
let reminderList =
    document.getElementById("reminderList");

// Counter to generate unique event IDs
let eventIdCounter = 1;

async function loadEventsFromDatabase(groupCode) {
    try {
        const response = await fetch(`/api/getEvents/${groupCode}`);
        if (response.ok) {
            events = (await response.json()).rows.map(event => ({
                id: event.event_id,
                date: event.event_date.split("T")[0], // Strip off the time part
                title: event.event_title,
                description: event.description
            }));

            console.log("Loaded events from database:", events); // Debug: inspect loaded events
            displayReminders();
            showCalendar(currentMonth, currentYear);
        } else {
            console.error("Failed to load events:", await response.text());
        }
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// Function to add events
function addEvent() {
    const date = eventDateInput.value;
    const title = eventTitleInput.value;
    const description = eventDescriptionInput.value;
    //const pathParts = window.location.pathname.split("/");
    //const groupCode = pathParts[pathParts.length - 1];
    groupCode = decodeURIComponent(window.location.pathname).split("/").pop();

    console.log("Extracted date:", date); // Debugging output
    console.log("Extracted groupCode:", groupCode); // Debugging output

    if (date && title && groupCode) {
        addEventToDatabase(groupCode, date, title, description).then((newEvent) => {
            if (newEvent) {
                events.push(newEvent); 
                showCalendar(currentMonth, currentYear);
                displayReminders();
            }
        });

        eventDateInput.value = "";
        eventTitleInput.value = "";
        eventDescriptionInput.value = "";
    } else {
        console.error("Missing required fields in addEvent");
    }
}

async function addEventToDatabase(groupCode, eventDate, eventTitle, description) {
    const formattedDate = new Date(eventDate).toISOString().split("T")[0];
    const payload = { groupCode, eventDate: formattedDate, eventTitle, description };
    
    console.log("Payload to be sent to server:", payload); // Debugging output

    try {
        const response = await fetch("/api/addEvent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log()
        if (response.ok) {
            const newEvent = await response.json();
            return {
                id: newEvent.event_id, 
                date: newEvent.event_date.split("T")[0], 
                title: newEvent.event_title, 
                description: newEvent.description
            };
        } else {
            console.error("Failed to add event:", await response.text());
        }
    } catch (error) {
        console.error("Error adding event:", error);
    }
    return null;
}

async function deleteEventFromDatabase(eventId) {
    try {
        await fetch(`/api/deleteEvent/${eventId}`, { method: "DELETE" });
        events = events.filter(event => event.id !== eventId); // Update local events array
        displayReminders();
        showCalendar(currentMonth, currentYear);
    } catch (error) {
        console.error("Error deleting event:", error);
    }
}

// Function to display reminders
function displayReminders() {
    reminderList.innerHTML = "";
    for (const event of events) {
        if (!event.date) continue; // Skip if event.date is undefined

        console.log("Displaying reminder for date:", event.date); // Debug: check each event date

        const [year, month, day] = event.date.split("-").map(Number);
        
        if (month - 1 === currentMonth && year === currentYear) {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${event.title}</strong> - ${event.description} on ${event.date}`;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-event";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function () {
                deleteEventFromDatabase(event.id);
            };

            listItem.appendChild(deleteButton);
            reminderList.appendChild(listItem);
        }
    }
}

// Function to generate a range of 
// years for the year select input
function generate_year_range(start, end) {
    let years = "";
    for (let year = start; year <= end; year++) {
        years += "<option value='" +
            year + "'>" + year + "</option>";
    }
    return years;
}

// Initialize date-related letiables
today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();
selectYear = document.getElementById("year");
selectMonth = document.getElementById("month");

createYear = generate_year_range(1970, 2050);

document.getElementById("year").innerHTML = createYear;

let calendar = document.getElementById("calendar");

let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
let days = [
    "Sun", "Mon", "Tue", "Wed",
    "Thu", "Fri", "Sat"];

$dataHead = "<tr>";
for (dhead in days) {
    $dataHead += "<th data-days='" +
        days[dhead] + "'>" +
        days[dhead] + "</th>";
}
$dataHead += "</tr>";

document.getElementById("thead-month").innerHTML = $dataHead;

monthAndYear =
    document.getElementById("monthAndYear");
showCalendar(currentMonth, currentYear);

// Function to navigate to the next month
function next() {
    currentYear = currentMonth === 11 ?
        currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

// Function to navigate to the previous month
function previous() {
    currentYear = currentMonth === 0 ?
        currentYear - 1 : currentYear;
    currentMonth = currentMonth === 0 ?
        11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
}

// Function to jump to a specific month and year
function jump() {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}

// Function to display the calendar
function showCalendar(month, year) {
    console.log("Events for calendar:", events); // Debug: check events for display
    let firstDay = new Date(year, month, 1).getDay();
    const tbl = document.getElementById("calendar-body");
    tbl.innerHTML = "";
    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                const cell = document.createElement("td");
                cell.appendChild(document.createTextNode(""));
                row.appendChild(cell);
            } else if (date > daysInMonth(month, year)) {
                break;
            } else {
                const cell = document.createElement("td");
                const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                cell.className = "date-picker";
                cell.innerHTML = `<span>${date}</span>`;

                // Highlight today's date
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.classList.add("selected");
                }

                // Check if there's an event for this date
                if (events.some(event => event.date === cellDateStr)) {
                    cell.classList.add("event-marker");
                    cell.appendChild(createEventTooltip(cellDateStr));
                }

                row.appendChild(cell);
                date++;
            }
        }
        tbl.appendChild(row);
    }

    displayReminders();
}

// Function to create an event tooltip
function createEventTooltip(dateStr) {
    const tooltip = document.createElement("div");
    tooltip.className = "event-tooltip";

    // Find all events on this date
    const eventsOnDate = events.filter(event => event.date === dateStr);
    for (const event of eventsOnDate) {
        const eventText = `<strong>${event.title}</strong> - ${event.description}`;
        const eventElement = document.createElement("p");
        eventElement.innerHTML = eventText;
        tooltip.appendChild(eventElement);
    }
    return tooltip;
}

// Function to get events on a specific date
function getEventsOnDate(date, month, year) {
    return events.filter(function (event) {
        let eventDate = new Date(event.date);
        return (
            eventDate.getDate() === date &&
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year
        );
    });
}

// Function to check if there are events on a specific date
function hasEventOnDate(date, month, year) {
    return getEventsOnDate(date, month, year).length > 0;
}

// Function to get the number of days in a month
function daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

// Initialize calendar on page load
document.addEventListener("DOMContentLoaded", function() {
    //yconst pathParts = window.location.pathname.split("/");
    //const groupCodename = pathParts[pathParts.length - 1];
    groupCodename = decodeURIComponent(window.location.pathname).split("/").pop();
    console.log("group name for calendar: ", groupCodename);
    /*if (groupCodename) {
        loadEventsFromDatabase(groupCodename);
    } else {
        console.error("No group codename found in the URL.");
    }*/
    loadEventsFromDatabase(groupCodename);
    console.log("Load events is being called");
});