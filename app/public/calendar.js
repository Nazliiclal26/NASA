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
            events = await response.json(); // Load events into the local `events` array
            displayReminders(); // Display reminders on the sidebar
            showCalendar(currentMonth, currentYear); // Refresh calendar view
        } else {
            console.error("Failed to load events:", await response.text());
        }
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// Function to add events
function addEvent() {
    let date = eventDateInput.value;
    let title = eventTitleInput.value;
    let description = eventDescriptionInput.value;

    if (date && title) {
        // Create a unique event ID
        let eventId = eventIdCounter++;

        events.push(
            {
                id: eventId, 
                date: date,
                title: title,
                description: description
            }
        );
        
        const pathParts = window.location.pathname.split("/");
        const groupCode = pathParts[pathParts.length - 1];
        console.log("group code: ", groupCode);
        addEventToDatabase(groupCode, date, title, description)

        showCalendar(currentMonth, currentYear);
        eventDateInput.value = "";
        eventTitleInput.value = "";
        eventDescriptionInput.value = "";
        displayReminders();
    }
}

async function addEventToDatabase(groupCode, eventDate, eventTitle, description) {
    try {
        const response = await fetch("/api/addEvent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupCode, eventDate, eventTitle, description })
        });
        if (response.ok) {
            const newEvent = await response.json();
            events.push(newEvent); // Add to local events array
            displayReminders();
            showCalendar(currentMonth, currentYear);
        } else {
            console.error("Failed to add event:", await response.text());
        }
    } catch (error) {
        console.error("Error adding event:", error);
    }
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
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let eventDate = new Date(event.date);
        if (eventDate.getMonth() ===
            currentMonth &&
            eventDate.getFullYear() ===
            currentYear) {
            let listItem = document.createElement("li");
            listItem.innerHTML =
                `<strong>${event.title}</strong> - 
            ${event.description} on 
            ${eventDate.toLocaleDateString()}`;

            // Add a delete button for each reminder item
            let deleteButton =
                document.createElement("button");
            deleteButton.className = "delete-event";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function () {
                deleteEventFromDatabase(eventId);
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
    let firstDay = new Date(year, month, 1).getDay();
    tbl = document.getElementById("calendar-body");
    tbl.innerHTML = "";
    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                cell = document.createElement("td");
                cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            } else if (date > daysInMonth(month, year)) {
                break;
            } else {
                cell = document.createElement("td");
                cell.setAttribute("data-date", date);
                cell.setAttribute("data-month", month + 1);
                cell.setAttribute("data-year", year);
                cell.setAttribute("data-month_name", months[month]);
                cell.className = "date-picker";
                cell.innerHTML = "<span>" + date + "</span";

                if (
                    date === today.getDate() &&
                    year === today.getFullYear() &&
                    month === today.getMonth()
                ) {
                    cell.className = "date-picker selected";
                }

                // Check if there are events on this date
                if (hasEventOnDate(date, month, year)) {
                    cell.classList.add("event-marker");
                    cell.appendChild(
                        createEventTooltip(date, month, year)
                );
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
function createEventTooltip(date, month, year) {
    let tooltip = document.createElement("div");
    tooltip.className = "event-tooltip";
    let eventsOnDate = getEventsOnDate(date, month, year);
    for (let i = 0; i < eventsOnDate.length; i++) {
        let event = eventsOnDate[i];
        let eventDate = new Date(event.date);
        let eventText = `<strong>${event.title}</strong> - 
            ${event.description} on 
            ${eventDate.toLocaleDateString()}`;
        let eventElement = document.createElement("p");
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

// Call the showCalendar function initially to display the calendar
// showCalendar(currentMonth, currentYear);

// Initialize calendar on page load
document.addEventListener("DOMContentLoaded", function() {
    const pathParts = window.location.pathname.split("/");
    const groupCodename = pathParts[pathParts.length - 1];
    if (groupCodename) {
        loadEventsFromDatabase(groupCodename);
    } else {
        console.error("No group codename found in the URL.");
    }
    showCalendar(currentMonth, currentYear);
});