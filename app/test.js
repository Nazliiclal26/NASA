res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Group ${groupCode}</title>
      <script src="/groupSearchBook.js" defer></script>
      <link rel="stylesheet" href="/calendar.css">
      <link rel="stylesheet" href="/group.css">
      <script src="/calendar.js" defer></script>
      <link rel="stylesheet" href="/account.css">
      <link rel="stylesheet" href="/selection.css">
      <link rel="stylesheet" href="/navbar.css">
      <link rel="stylesheet" href="/watchlistModal.css">
    </head>
    <body>

    <main>

    <div id="navbar">
      <div id="leftPanel">
        <div id="typeButtons">
          <div id="home">Home</div>
        </div>
      </div>
      <div id="searchBox">
        <div id="searchSection" style="display: flex;">
          <input type="text" id="searchTitle" placeholder="Search for a book...">
          <button id="searchFilm">Search</button>
        </div>
      </div>
      <div id="navButtons">
        <div id="buttonContainerNav">
          <div id="watchlist">
            <a href="#" id="watchlistLink">My Watchlist</a>
          </div>
          <script>
            document.getElementById("watchlistLink").addEventListener("click", () => {
              const userId = localStorage.getItem("userId");
              if (userId) {
                window.location.href = "watchlist.html";
              } else {
                alert("User not logged in.");
              }
            });
          </script>
          <div id="account">Account</div>
          <div id="logout">
            <img src="/images/logout.png" width="30px" />
          </div>
        </div>
      </div>
    </div>
    <div id="searchResult"></div>
    <div id="mainBlock">
      <div id="leftSide">
        <div class="box">
          <div id="options">
            <div id="buttonContainer">
              <button id="stopVote">Stop Vote</button>
              <button id="startVote">Start Voting</button>
              <button id="membersButton">Members</button>
              <div id="membersListWrapper"> 
                <ul id="membersList"></ul>
              </div>
            </div>
          </div>
          <div id="votingBox">
            <div>
          <h2 id="votedBooksTitle" >Voted Books</h2>
          <ul id="votedBooks"></ul>
        </div>

        <div id="mostVotedBook"></div>
          </div>
        </div>
        <div id="calendarBox"> 
          <div class="wrapper">
          <div class="container-calendar">
            <div id="left">
              <h1>Calendar</h1>
              <div id="event-section">
                <h3>Add Event</h3>
                <input type="date" id="eventDate">
                <input type="text"
                  id="eventTitle"
                  placeholder="Event Title">
                <input type="text"
                id="eventDescription"
                  placeholder="Event Description">
                <button id="addEvent" onclick="addEvent()">Add</button>
            </div>
            <div id="reminder-section">
              <h3>Reminders For This Month</h3>
              <!-- List to display reminders -->
              <ul id="reminderList">
                  <li data-event-id="1">
                      <strong>Event Title</strong>
                      - Event Description on Event Date
                      <button class="delete-event"
                          onclick="deleteEvent(1)">Delete</button>
                  </li>
                </ul>
              </div>
            </div>
          <div id="right">
            <h3 id="monthAndYear"></h3>
            <div class="button-container-calendar">
              <button id="previous" onclick="previous()">‹</button>
              <button id="next" onclick="next()">›</button>
            </div>
            <table class="table-calendar"
              id="calendar"
              data-lang="en">
              <thead id="thead-month"></thead>
              <!-- Table body for displaying the calendar -->
              <tbody id="calendar-body"></tbody>
            </table>
            <div class="footer-container-calendar">
                <label for="month">Jump To: </label>
                <!-- Dropdowns to select a specific month and year -->
                <select id="month" onchange="jump()">
                  <option value=0>Jan</option>
                  <option value=1>Feb</option>
                  <option value=2>Mar</option>
                  <option value=3>Apr</option>
                  <option value=4>May</option>
                  <option value=5>Jun</option>
                  <option value=6>Jul</option>
                  <option value=7>Aug</option>
                  <option value=8>Sep</option>
                  <option value=9>Oct</option>
                  <option value=10>Nov</option>
                  <option value=11>Dec</option>
                </select>
                <!-- Dropdown to select a specific year -->
                <select id="year" onchange="jump()"></select>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div id="rightSide">
      <div id="info">
        <header>
        <span id="outerBox">
          <span id="pageHeader">
            <h1>Welcome to ${groupCode}</h1>
          </span>
          <button id="leaveGroup">Leave Group</button>
        </span>
      </header>
      </div>
        <div id="chatBox">
          <div id="chatSection">
          <h2>Chat</h2>
          <ul id="messages"></ul>
          <div style="text-align:center">
            <input id="messageInput" placeholder="Type a message..." />
            <button id="sendButton">Send</button></div>
          </div>
        </div>  
        </div>
      </div>
    </div>
      <main>

        <div id="watchlistModalMain">
          <div id="modalButtonWatch">
            <div id="watchButton">
              <img id="watchIcon" src="/images/watch.png" height="50px" />
            </div>
          </div>

          <div id="mainModalWatch" class="hidden">
            <div id="mainWatchModalButton" style="background: rgb(15, 158, 213);">
              <img id="closeIcon" src="/images/arrow_white.png" width="30px" />
            </div>
            <div id="groupModal" style="background: rgb(15, 158, 213);">
              <h2 style="color: white;">Group Watchlist</h2>
                <div id="groupWatchlistContainer" style="height: 400px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;"> 
                  <ul id="groupWatchlist" style="list-style: none"></ul>
                </div>
            </div>
          </div>
        </div>

        <div id="groupModalMain">
        <div id="modalButton">
          <div id="groupButton">
            <img id="groupIcon" src="/images/group.png" height="50px" />
          </div>
        </div>

        <div id="mainModal" class="hidden">
          <div id="mainGroupModalButton">
            <img id="closeIcon" src="/images/arrowGroup.png" width="30px" />
          </div>
          <div id="groupModal">
            <div id="title">My Groups</div>
            <div id="groupsContainer">
              <ul id="groupsList"></ul>
            </div>
            <div id="groupActions">
              <div id="joinButton">Join</div>
              <div id="addButton">Add</div>
            </div>
          </div>
        </div>
      </div>

      <div id="joinModal" class="hidden">
        <div id="joinGroupModalButton">
          <img id="closeIcon" src="/images/arrowGroup.png" width="30px" />
        </div>
        <div id="groupModal">
          <div id="title">My Groups</div>
          <div id="groups">
            <div id="titleGroup">Enter Group Code</div>
            <input
              type="text"
              id="code"
              name="code"
              placeholder="Enter code..."
            />
            <div id="random">Random</div>
            <div id="joinGroup">Join</div>
          </div>
          <div id="groupActions">
            <div id="joinGroupHome">Groups</div>
            <div id="joinAddButton">Add</div>
          </div>
        </div>
      </div>

      <div id="createModal" class="hidden">
        <div id="createGroupModalButton">
          <img id="closeIcon" src="/images/arrowGroup.png" width="30px" />
        </div>
        <div id="groupModal">
          <div id="title">My Groups</div>
          <div id="groups">
            <div id="titleGroup">Name</div>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter group name..."
            />
            <div id="titleGroupName">Type</div>
            <div id="typeButtonsModalType">
              <div class="groupButtons" id="booksButton">Book</div>
              <div class="groupButtons" id="moviesButton">Movie</div>
            </div>
            <div id="titleGroupName">Access</div>
            <div id="typeButtonsModalAccess">
              <div class="groupButtons" id="publicButton">Public</div>
              <div class="groupButtons" id="privateButton">Private</div>
            </div>
            <div id="create">Create</div>
          </div>
          <div id="groupActions">
            <div id="createHomeButton">Groups</div>
            <div id="createJoinButton">Join</div>
          </div>
        </div>
      </div>
      </main>
      <script src="/socket.io/socket.io.js"></script>
      <script src="/new.js"></script>
       <script src="/navbar.js"></script>
    </body>
    </html>
  `);
