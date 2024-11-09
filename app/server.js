let axios = require("axios");
let argon2 = require("argon2");
const pg = require("pg");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
const group = require("../models/Group");

const authRoutes = require('./routes/authRoutes');

let { Server } = require("socket.io");
let io = new Server(server);

pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());
app.use(authRoutes);

app.post("/codeValid", async (req, res) => {
  let { code } = req.body;

  try {
    let result = await pool.query(
      "SELECT * FROM groups WHERE group_name = $1",
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
      return res.json({
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
      res.json({
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
        `INSERT INTO groups (group_name, leader_id, group_type, privacy, members) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [groupName, leaderId, groupType, access, memberList]
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
        "SELECT * FROM groups WHERE group_name = $1",
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

      let update;
      if (group.members) {
        update = [...group.members, userId];
      } else {
        update = [userId];
      }

      let updateRes = await pool.query(
        "UPDATE groups SET members = $1 WHERE group_name = $2 RETURNING *",
        [update, code]
      );

      res.status(200).json({
        status: "success",
        message: "joined group",
        group: updateRes.rows[0],
      });
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
app.get("/group/:groupCode", (req, res) => {
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

        <a href="/">Back to Home</a>

        <div id="chatSection">
          <h2>Chat</h2>
          <ul id="messages"></ul>
          <div style="text-align:center">
            <input id="messageInput" placeholder="Type a message..." />
            <button id="sendButton">Send</button></div>
          </div>
      </main>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        let socket = io();
        socket.on("connect", () => { console.log("Socket has been connected."); });
        let send = document.getElementById("sendButton");
        let input = document.getElementById("messageInput");
        let messages = document.getElementById("messages");
        send.addEventListener("click", () => {
          let message = input.value;
          if (message === '') {
            return;
          }
          appendSentMessage(message);  
          console.log("Sending message:", message);
          socket.emit('sendMessageToRoom', {message});
        });

        socket.on("receive", (data) => {
          console.log("Received message:", data);
          appendReceivedMessage(data); 
        });
        
        function appendReceivedMessage(msg) {
          let msgBox = document.createElement("li");
          msgBox.textContent = msg;
          msgBox.style.textAlign = "left";
          msgBox.style.listStyleType = "none";
          messages.appendChild(msgBox);
        }

        function appendSentMessage(msg) {
          let msgBox = document.createElement("li");
          msgBox.textContent = msg;
          msgBox.style.textAlign = "right";
          messages.appendChild(msgBox);
        }
      </script>
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
          </style>
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

              <a href="/">Back to Home</a>
              <div id="chatSection">
          <h2>Chat</h2>
          <ul id="messages"></ul>
          <div style="text-align:center">
            <input id="messageInput" placeholder="Type a message..." />
            <button id="sendButton">Send</button></div>
          </div>
      </main>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        let socket = io();
        socket.on("connect", () => { console.log("Socket has been connected."); });
        let send = document.getElementById("sendButton");
        let input = document.getElementById("messageInput");
        let messages = document.getElementById("messages");
        send.addEventListener("click", () => {
          let message = input.value;
          if (message === '') {
            return;
          }
          appendSentMessage(message);  
          console.log("Sending message:", message);
          socket.emit('sendMessageToRoom', {message});
        });

        socket.on("receive", (data) => {
          console.log("Received message:", data);
          appendReceivedMessage(data); 
        });
        
        function appendReceivedMessage(msg) {
          let msgBox = document.createElement("li");
          msgBox.textContent = msg;
          msgBox.style.textAlign = "left";
          msgBox.style.listStyleType = "none";
          messages.appendChild(msgBox);
        }

        function appendSentMessage(msg) {
          let msgBox = document.createElement("li");
          msgBox.textContent = msg;
          msgBox.style.textAlign = "right";
          messages.appendChild(msgBox);
        }
      </script>
      </body>
      </html>
  `);
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
  let { groupCode, filmTitle, poster } = req.body;

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
      await pool.query(
        "INSERT INTO votes (group_code, film_title, poster, num_votes) VALUES ($1, $2, $3, 1)",
        [groupCode, filmTitle, poster]
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
      "SELECT film_title, poster, num_votes FROM votes WHERE group_code = $1",
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

app.get("/bookVotes/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      "SELECT title, poster, num_votes FROM votes WHERE group_code = $1",
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
      "SELECT * FROM votes WHERE group_code = $1 AND title = $2",
      [groupCode, filmTitle]
    );

    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE votes SET num_votes = num_votes + 1 WHERE group_code = $1 AND title = $2",
        [groupCode, filmTitle]
      );
    } else {
      await pool.query(
        "INSERT INTO votes (group_code, title, poster, num_votes) VALUES ($1, $2, $3, 1)",
        [groupCode, filmTitle, poster]
      );
    }

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error recording vote" });
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

  socket.on("sendMessageToRoom", ({ message }) => {
    console.log("Sending", message, "to room:", roomId);
    for (let roommateId of Object.keys(rooms[roomId])) {
      if (roommateId === socket.id) {
        continue;
      }
      console.log("Sending", message, "to member", roommateId);
      rooms[roomId][roommateId].emit("receive", message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} of room ${roomId} has disconnected`);
    delete rooms[roomId][socket.id];
  });
});

server.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
