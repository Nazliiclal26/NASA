let axios = require("axios");
let argon2 = require("argon2");
const pg = require("pg");
const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const http = require("http");
const app = express();

const server = http.createServer(app);

const path = require("path");

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
const group = require("../models/Group");
const messages = require("../models/Messages");
const user = require("../models/user");

const authRoutes = require('../routes/authRoutes');
const calendarRoutes = require('../routes/calendarRoutes');
app.use('/calendar', calendarRoutes);

let { Server } = require("socket.io");
const { timeStamp } = require("console");
let io = new Server(server);

pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public", { index: false }));
app.use(express.json());
app.use(authRoutes);
app.use(cookieParser());

// structure of "username": "cookie-token"
let tokenStorage = {};
tokenOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

/*
  New Token Storage:
  tokenStorage = {
  "--random Token here --" : 
    {
      "username" : "--user's username here--",
      "currentPage" "either 'books' or 'movies'", // Unimplemented
      other attributes to follow
    }
  }
*/

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/:userId/watchlist.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "watchlist.html"));
});

app.post("/startVoting/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;
  let fullGroupName = `Group ${groupCode}`;

  try {
    let result = await pool.query(
      "UPDATE groups SET voting_status = FALSE WHERE group_name = $1 or group_name = $2",
      [groupCode, fullGroupName]
    );

    if (result.rowCount === 0 || result2.rowCount === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Voting started" });
  } catch (error) {
    console.error("Error starting voting:", error);
    res.status(500).json({ message: "Error starting voting" });
  }
});

app.get("/getVotingStatus/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;
  let fullGroupName = `Group ${groupCode}`;

  try {
    let result = await pool.query(
      "SELECT voting_status FROM groups WHERE group_name = $1 OR group_name = $2",
      [groupCode, fullGroupName]
    );

    res.status(200).json({ votingStatus: result.rows[0].voting_status });
  } catch (error) {
    res.status(500).json({ message: "Error fetching voting status" });
  }
});

app.post("/stopVoting/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;
  let fullGroupName = `Group ${groupCode}`;

  try {
    //console.log("here");
    await pool.query(
      "UPDATE groups SET voting_status = TRUE WHERE group_name = $1 or group_name = $2",
      [groupCode, fullGroupName]
    );
    res.status(200).json({ message: "Voting stopped" });
  } catch (error) {
    console.error("Error stopping voting:", error);
    res.status(500).json({ message: "Error stopping voting" });
  }
});

app.post("/codeValid", async (req, res) => {
  let { code } = req.body;
  try {
    let result = await pool.query(
      "SELECT * FROM groups WHERE secret_code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.json({ isValid: true });
    } else {
      return res.json({ isValid: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/changeUser", async (req, res) => {
  let { userId, username } = req.body;

  console.log(username, userId);

  let result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  if (result.rows.length > 0) {
    return res.json({ status: "error", message: "username already exists" });
  } else {
    await pool.query("UPDATE users SET username = $1 WHERE id = $2", [
      username,
      userId,
    ]);
    return res.json({ status: "success", message: "username changed" });
  }
});

app.post("/changePass", async (req, res) => {
  let { userId, password } = req.body;

  let result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

  if (result.rows.length > 0) {
    let userHash = result.rows[0].password;
    let match = await argon2.verify(userHash, password);

    if (match) {
      return res.json({
        status: "error",
        message: "password is the same as before",
      });
    } else {
      let newPassHash = await argon2.hash(password);

      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
        newPassHash,
        userId,
      ]);
      return res.json({ status: "success", message: "password changed" });
    }
  } else {
    return res.json({ status: "error", message: "users not found" });
  }
});

app.get("/getMostVoted/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      "SELECT * FROM votes WHERE group_code = $1 ORDER BY votes DESC LIMIT 1",
      [groupCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No most voted film found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching most voted film" });
  }
});

app.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username.trim() || !password.trim()) {
    return res.json({ status: "error", message: "Missing input" });
  }

  try {
    let result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    let user = result.rows[0];
    let userHash = user.password;

    let match = await argon2.verify(userHash, password);

    if (match) {
      console.log("Login Success");
      let token = makeToken();
      tokenStorage[token] = {};
      tokenStorage[token]["username"] = username;
      console.log(tokenStorage);
      return res.cookie("token", token, tokenOptions).json({
        status: "success",
        message: "Login Successful",
        userId: user.id,
      });
    } else {
      return res.json({
        status: "error",
        message: "Invalid username or password",
      });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.post("/signUp", async (req, res) => {
  let { firstName, lastName, username, password, repeatPass } = req.body;
  let preferred_genres = [];

  console.log(firstName, lastName, username, password, repeatPass);

  try {
    let userCheck = await pool.query(
      "SELECT 1 FROM users WHERE username = $1",
      [username]
    );
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !password.trim() ||
      !repeatPass.trim()
    ) {
      return res.json({ status: "error", message: "Missing input" });
    } else if (userCheck.rows.length > 0) {
      return res.json({
        status: "error",
        message: "Username no longer available",
      });
    } else if (password !== repeatPass) {
      return res.json({ status: "error", message: "Passwords don't match" });
    } else {
      let hash = await argon2.hash(password);
      let result = await pool.query(
        "INSERT INTO users (first_name, last_name, username, password, preferred_genres) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [firstName, lastName, username, hash, preferred_genres]
      );
      let user = result.rows[0];
      let token = makeToken();
      tokenStorage[token] = {};
      tokenStorage[token]["username"] = username;
      console.log(tokenStorage);
      res.cookie("token", token, tokenOptions).json({
        status: "success",
        message: "Sign Up Successful",
        userId: user.id,
      });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "error" });
    console.error("Error signing up:", error);
  }
});

app.post("/signUpPrompt", async (req, res) => {
  let { userID, genres } = req.body;

  console.log(genres);

  try {
    let result = await pool.query(
      "UPDATE users SET preferred_genres = $1 WHERE id = $2 RETURNING id, preferred_genres",
      [genres, userID]
    );

    res.json({
      status: "success",
      message: "genres updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "error" });
  }
});

app.post("/createGroup", async (req, res) => {
  let { groupName, groupType, access, leaderId } = req.body;
  let memberList = [leaderId];
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    let rand = Math.floor(Math.random() * chars.length);
    code += chars.charAt(rand);
  }

  if (!leaderId) {
    return res.status(400).json({ message: "Leader ID is missing" });
  }

  let checkGroupName = await pool.query(
    "SELECT * FROM groups WHERE group_name = $1",
    [groupName]
  );

  if (checkGroupName.rows.length > 0) {
    res
      .status(400)
      .json({ status: "error", message: "group name already exists" });
  } else {
    try {
      let result = await pool.query(
        `INSERT INTO groups (group_name, leader_id, group_type, privacy, members, secret_code) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [groupName, leaderId, groupType, access, memberList, code]
      );

      res.status(200).json({
        status: "success",
        message: "Group created",
        group: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Error creating group" });
    }
  }
});

app.post("/joinGroup", async (req, res) => {
  let { type, code, userId } = req.body;

  if (type === "code") {
    try {
      if (!code || !userId) {
        return res
          .status(400)
          .json({ status: "error", message: "missing code or userId" });
      }

      let groupCheck = await pool.query(
        "SELECT * FROM groups WHERE secret_code = $1",
        [code]
      );

      if (groupCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "group not found" });
      }

      let group = groupCheck.rows[0];

      if (group.members && group.members.includes(userId)) {
        return res
          .status(400)
          .json({ status: "error", message: "user already in group" });
      }

      if (group.privacy !== "private") {
        let update;
        if (group.members) {
          update = [...group.members, userId];
        } else {
          update = [userId];
        }

        let updateRes = await pool.query(
          "UPDATE groups SET members = $1 WHERE secret_code = $2 RETURNING *",
          [update, code]
        );

        res.status(200).json({
          status: "success",
          message: "joined group",
          group: updateRes.rows[0],
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "group is private",
          group: updateRes.rows[0],
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Error joining group" });
    }
  } else if (type === "random") {
    try {
      let groupCheck = await pool.query(
        "SELECT * FROM groups WHERE privacy = $1 AND NOT $2 = ANY(members)",
        ["public", userId]
      );
      let chosenGroupId;

      console.log(groupCheck);

      let numGroups = groupCheck.rowCount;

      if (numGroups >= 1) {
        let possibleId = groupCheck.rows.map((row) => row.id);
        let randomId = Math.floor(Math.random() * numGroups);

        chosenGroupId = possibleId[randomId];
      } else {
        return res
          .status(404)
          .json({ status: "error", message: "no available public groups" });
      }

      let randomGroup = await pool.query("SELECT * FROM groups WHERE id = $1", [
        chosenGroupId,
      ]);

      if (randomGroup.rows.length === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "group not found" });
      }

      let groupRandom = randomGroup.rows[0];

      if (groupRandom.members && groupRandom.members.includes(userId)) {
        return res
          .status(400)
          .json({ status: "error", message: "user already in group" });
      }

      let updateRandom;
      if (groupRandom.members) {
        updateRandom = [...groupRandom.members, userId];
      } else {
        updateRandom = [userId];
      }

      let result = await pool.query(
        "UPDATE groups SET members = $1 WHERE id = $2 RETURNING *",
        [updateRandom, chosenGroupId]
      );

      res.status(200).json({
        status: "success",
        message: "joined random group",
        group: result.rows[0],
      });
    } catch (error) {
      alert("ERROR");
    }
  }
});

app.post("/create", async (req, res) => {
  let { groupCode, leaderId, privacy } = req.body;
  let groupName = `Group ${groupCode}`;
  let groupType = "movie";

  if (!leaderId) {
    return res.status(400).json({ message: "Leader ID is missing" });
  }

  try {
    let leaderCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
      leaderId,
    ]);
    if (leaderCheck.rows.length === 0) {
      return res.status(404).json({ message: "Leader not found" });
    }

    let result = await pool.query(
      `INSERT INTO groups (group_name, leader_id, group_type, privacy) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
      [groupName, leaderId, groupType, privacy]
    );

    res.status(201).json({ message: "Group created", group: result.rows[0] });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Error creating group" });
  }
});

// Adding client-side room functionality here - is called upon redirect to 'group/:groupId' in movies.js
app.get("/movieGroup/:groupCode", (req, res) => {
  const groupCode = req.params.groupCode;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Group ${groupCode}</title>
      <script src="/groupSearchMovie.js" defer></script>
      <style>
        .film-card {
          position: relative;
          display: inline-block;
          margin: 10px;
        }
        .vote-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: red;
          color: white;
          border: none;
          padding: 5px;
          cursor: pointer;
        }
        #messages { list-style-type: none; padding: 0; }
        #messages li { margin: 10px 0; }
      </style>
      <link rel="stylesheet" href="/calendar.css">
      <script src="/calendar.js" defer></script>
    </head>
    <body>
      <header>
        <h1>Welcome to Group ${groupCode}</h1>
      </header>
      <main>
        <div id="searchSection">
          <h2>Search for a Film</h2>
          <input type="text" id="searchTitle" placeholder="Title">
          <button id="searchFilm">Search</button>
          <div id="searchResult"></div>
        </div>

        <div>
          <h2>Voted Films</h2>
          <ul id="votedFilms"></ul>
        </div>

        <div id="mostVotedFilm"></div>

        <button id="stopVote">Stop Vote</button>
        <button id="startVote">Start Voting</button>

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

        <a href="/selection.html">Back to Home</a>

        <div id="chatSection">
          <h2>Chat</h2>
          <ul id="messages"></ul>
          <div style="text-align:center">
            <input id="messageInput" placeholder="Type a message..." />
            <button id="sendButton">Send</button></div>
          </div>
      </main>
      <script src="/socket.io/socket.io.js"></script>
    </body>
    </html>
  `);
});

app.get("/bookGroup/:groupCode", (req, res) => {
  const groupCode = req.params.groupCode;

  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Group ${groupCode}</title>
          <script src="/groupSearchBook.js" defer></script>
          <style>
              .film-card {
                  position: relative;
                  display: inline-block;
                  margin: 10px;
              }
              .vote-btn {
                  position: absolute;
                  top: 10px;
                  right: 10px;
                  background-color: red;
                  color: white;
                  border: none;
                  padding: 5px;
                  cursor: pointer;
              }
              #messages { list-style-type: none; padding: 0; }
              #messages li { margin: 10px 0; }
          </style>
          <link rel="stylesheet" href="/calendar.css">
          <script src="/calendar.js" defer></script>
      </head>
      <body>
          <header>
              <h1>Welcome to Group ${groupCode}</h1>
          </header>
          <main>
              <div id="searchSection">
                  <h2>Search for a Book</h2>
                  <input type="text" id="searchTitle" placeholder="Title">
                  <button id="searchBook">Search</button>
                  <div id="searchResult"></div>
              </div>

              <div>
                  <h2>Voted Book</h2>
                  <ul id="votedBooks"></ul>
              </div>

              <div id="mostVotedBook"></div>

              <button id="stopVote">Stop Vote</button>
              <button id="startVote">Start Voting</button>
              
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
                      <button id="addEvent" onclick="addEvent()">
                        Add
                      </button>
                  </div>
                  <div id="reminder-section">
                    <h3>Reminders For This Month</h3>
                    <!-- List to display reminders -->
                    <ul id="reminderList">
                        <li data-event-id="1">
                            <strong>Event Title</strong>
                            - Event Description on Event Date
                            <button class="delete-event"
                                onclick="deleteEvent(1)">
                                Delete
                            </button>
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

              <a href="/selection.html">Back to Home</a>
              <div id="chatSection">
          <h2>Chat</h2>
          <ul id="messages"></ul>
          <div style="text-align:center">
            <input id="messageInput" placeholder="Type a message..." />
            <button id="sendButton">Send</button></div>
          </div>
      </main>
      <script src="/socket.io/socket.io.js"></script>
      </body>
      </html>
  `);
});

app.post("/addMessage", async (req, res) => {
  let sentUser = req.body["sentUser"];
  let message = req.body["message"];
  let groupName = req.body["groupName"];
  if (sentUser === undefined || sentUser === null) {
    return res.status(400).json({ error: "sentUser is not defined" });
  }

  if (message === undefined || message === null) {
    return res.status(400).json({ error: "message is not defined" });
  }

  if (groupName === undefined || groupName === null) {
    return res.status(400).json({ error: "group name is not defined" });
  }

  console.log(
    "Attempting to add message:",
    message,
    ", in group",
    groupName,
    ", to db"
  );

  let groupId = null;
  await group.findByName(groupName).then((body) => {
    groupId = body.id; // Returns a singular row from group table so we just pass the id
  });

  let userId = null;
  await user.findByUsername(sentUser).then((body) => {
    userId = body.id;
  });

  let result = false;
  await messages.add(groupId, userId, message).then((body) => {
    result = true;
  });

  if (result) {
    return res.status(200).json({});
  } else {
    return res.status(500).json({ error: "Internal server error!" });
  }
});

app.get("/getUsernameForGroup", (req, res) => {
  // Utilize cookies to return username
  let { token } = req.cookies;
  if (token === undefined) {
    console.log("No cookies set for this username.");
    return res.status(500).json({
      error: "No cookie set for this user, internal issue with user setup.",
    });
  } else if (tokenStorage[token] === undefined) {
    console.log("Server storage not properly accounting for this username.");
    return res.status(400).json({
      error:
        "No cookie set for this user, ensure user was initialized properly.",
    });
  }

  return res.status(200).json({ username: tokenStorage[token]["username"] });
});

app.get("/getMessages", async (req, res) => {
  let groupName = req.query.groupName;

  let { token } = req.cookies;
  if (token === undefined) {
    console.log("No cookies set for this username.");
    return res.status(500).json({
      error: "No cookie set for this user, internal issue with user setup.",
    });
  } else if (tokenStorage[token] === undefined) {
    console.log("Server storage not properly accounting for this username.");
    return res.status(500).json({
      error:
        "No cookie set for this user, ensure user was initialized properly.",
    });
  } else {
    console.log(token);
  }
  let username = tokenStorage[token]["username"];

  // Get group id given group name
  let groupId = null;
  await group.findByName(groupName).then((body) => {
    groupId = body.id; // Returns a singular row from group table so we just pass the id
  });
  // Get messages by group id
  let messageCollection = {};
  await messages.getMessagesByGroupId(groupId).then((rows) => {
    messageCollection = rows;
  });
  // Create message object
  let messageObj = {
    username: username,
    messages: messageCollection,
  };
  // data gon be like { username: "username", messages: [{ username: "message" }] }
  return res.status(200).json(messageObj);
});

app.get("/groupSearch", (req, res) => {
  let title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Input Title" });
  }

  let url = `https://www.omdbapi.com/?t=${title}&apikey=cba0ff47`;

  axios
    .get(url)
    .then((response) => {
      let data = response.data;

      if (data.Response === "False") {
        return res.status(404).json({ message: "Film not found" });
      }

      let information = {
        title: data.Title,
        poster: data.Poster,
        rating: data.imdbRating,
        genre: data.Genre,
        plot: data.Plot,
      };

      res.status(200).json(information);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching film data" });
    });
});

app.post("/vote", async (req, res) => {
  let { groupCode, filmTitle, poster, filmGenre } = req.body;

  try {
    let result = await pool.query(
      "SELECT * FROM votes WHERE group_code = $1 AND film_title = $2",
      [groupCode, filmTitle]
    );

    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE votes SET num_votes = num_votes + 1 WHERE group_code = $1 AND film_title = $2",
        [groupCode, filmTitle]
      );
    } else {
      //console.log("Data for vote insertion:", { groupCode, filmTitle, poster, filmGenre });
      await pool.query(
        "INSERT INTO votes (group_code, film_title, poster, num_votes, film_genre) VALUES ($1, $2, $3, 1, $4)",
        [groupCode, filmTitle, poster, filmGenre]
      );
    }

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error recording vote" });
  }
});

app.get("/votes/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      "SELECT film_title, poster, num_votes, film_genre FROM votes WHERE group_code = $1",
      [groupCode]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes" });
  }
});

app.delete("/clearVotes/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    await pool.query("DELETE FROM votes WHERE group_code = $1", [groupCode]);
    res.status(200).json({ message: "Votes deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting votes" });
  }
});

app.get("/getGroups/:userId", async (req, res) => {
  let userId = req.params.userId;
  try {
    let { rows } = await pool.query(
      "SELECT * FROM groups WHERE $1 = ANY (members)",
      [userId]
    );

    res.json({
      status: "success",
      rows: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "user not in any groups",
    });
  }
});

app.get("/getGenres/:userId", async (req, res) => {
  let userId = req.params.userId;
  try {
    let { rows } = await pool.query(
      "SELECT preferred_genres FROM users WHERE id = $1",
      [userId]
    );

    res.json({
      status: "success",
      rows: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "error",
    });
  }
});

app.get("/getUsername/:userId", async (req, res) => {
  let userId = req.params.userId;
  try {
    let { rows } = await pool.query(
      "SELECT username FROM users WHERE id = $1",
      [userId]
    );
    res.json({
      status: "success",
      rows: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "username not available",
    });
  }
});

app.get("/bookVotes/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      "SELECT book_title, num_votes, poster FROM votes WHERE group_code = $1",
      [groupCode]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes" });
  }
});

app.get("/groupSearchBook", (req, res) => {
  let title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Input title" });
  }

  let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
    title
  )}&key=AIzaSyA7W8k35xcWplp6773PLBHKwqQyMPJ6VVY`;

  axios
    .get(url)
    .then((response) => {
      let books = response.data.items;

      if (!books || books.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }
      let book = books[0].volumeInfo;

      let information = {
        title: book.title,
        poster: book.imageLinks ? book.imageLinks.thumbnail : "",
        authors: book.authors ? book.authors.join(", ") : "N/A",
        publishedDate: book.publishedDate,
        description: book.description
          ? book.description
          : "No description available.",
      };

      res.status(200).json(information);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching book data" });
    });
});

app.post("/bookVote", async (req, res) => {
  let { groupCode, filmTitle, poster } = req.body;

  try {
    let result = await pool.query(
      "SELECT * FROM votes WHERE group_code = $1 AND book_title = $2",
      [groupCode, filmTitle]
    );

    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE votes SET num_votes = num_votes + 1 WHERE group_code = $1 AND book_title = $2",
        [groupCode, filmTitle]
      );
    } else {
      await pool.query(
        "INSERT INTO votes (group_code, book_title, num_votes, poster) VALUES ($1, $2, $3, 1)",
        [groupCode, filmTitle, poster]
      );
    }

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error recording vote" });
  }
});

app.post("/addToWatchlist", async (req, res) => {
  let { type, title, userId } = req.body;

  try {
    let checkWatch = await pool.query(
      "SELECT * FROM user_watchlists WHERE item_type = $1 AND item_id = $2 AND user_id = $3",
      [type, title, userId]
    );

    if (checkWatch.rows.length > 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Item already in watchlist" });
    }

    let result = await pool.query(
      "INSERT INTO user_watchlists (item_type, item_id, user_id) VALUES ($1, $2, $3)",
      [type, title, userId]
    );

    res.status(200).json({ status: "success", message: "Adding to watchlist" });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error adding to watchlist" });
  }
});

/* SOCKET FUNCTIONALITY */
// The key:value pairs of Rooms has the structure: { "groupId" : {socketId : socket} }
let rooms = {};

io.on("connection", (socket) => {
  console.log("Socket ", socket.id, " has been connected.");
  console.log("Adding socket to room...");

  let url = socket.handshake.headers.referer;
  let pathParts = url.split("/");
  let roomId = pathParts[pathParts.length - 1];

  if (!rooms.hasOwnProperty(roomId)) {
    rooms[roomId] = {};
    console.log("Socket room for Room id", roomId, "has been created");
  }

  rooms[roomId][socket.id] = socket;
  console.log(
    `Numbers of members in room ${roomId}: ${Object.keys(rooms[roomId]).length}`
  );

  socket.on("sendMessageToRoom", ({ message, username }) => {
    console.log("Sending", message, "to room:", roomId);
    for (let roommateId of Object.keys(rooms[roomId])) {
      if (roommateId === socket.id) {
        continue;
      }
      rooms[roomId][roommateId].emit("receive", message, username);
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} of room ${roomId} has disconnected`);
    delete rooms[roomId][socket.id];
  });
});

const db = require('../config/db'); 

// Endpoint to add an event
app.post('/api/addEvent', async (req, res) => {
  const { groupCode, eventDate, eventTitle, description } = req.body;

  // Debugging: Log received data
  console.log("Received data on server:", { groupCode, eventDate, eventTitle, description });

  if (!eventDate || !eventTitle || !groupCode) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const query = `
          INSERT INTO group_events (group_code, event_date, event_title, description)
          VALUES ($1, $2, $3, $4) RETURNING *`;
      const values = [groupCode, eventDate, eventTitle, description];

      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]); // Respond with the newly created event
  } catch (err) {
      console.error("Database error:", err); // Log any errors
      res.status(500).json({ error: err.message });
  }
});

// Endpoint to get events for a specific group
app.get("/api/getEvents/:groupCode", async (req, res) => {
  const { groupCode } = req.params;
  try {
      const result = await pool.query(
          "SELECT * FROM group_events WHERE group_code = $1 ORDER BY event_date",
          [groupCode]
      );
      res.json(result.rows);
  } catch (err) {
      console.error("Error retrieving events:", err.stack);
      res.status(500).json({ error: err.message });
  }
});

// Endpoint to delete an event
app.delete("/api/deleteEvent/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
      await pool.query("DELETE FROM group_events WHERE event_id = $1", [eventId]);
      res.status(204).send();
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

server.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
