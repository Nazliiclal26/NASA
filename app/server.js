let axios = require("axios");
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

let { Server } = require("socket.io");
let io = new Server(server);

pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());


app.post("/create", async (req, res) => {
  let groupCode = req.body.groupCode;

  if (!groupCode || groupCode.length !== 10) {
    return res.status(400).json({ message: "Invalid group code" });
  }
  // Have to add actual call to database here so that actual group is created
  // HARDCODED USER TO CREATE GROUPS WITHIN LOCAL DB -- 
    // only for purposes of testing, since current code doesn't have access to sign-in/register
  let userId = 1;
  console.log("Initiating create group call to db for movies");
  await group.create(groupCode, userId, "movie").then((body) => {
    res.status(200).json({ message: "Group created", groupCode });
  }).catch((error) => { 
    console.log(error);
    return res.status(500).json({message: "Server req to DB failed"});
  });
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



app.get("/groupSearch", (req, res) => {
  let title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Input Title" });
  }

  let url = `https://www.omdbapi.com/?t=${title}&apikey=cba0ff47`;

  axios.get(url)
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
        plot: data.Plot
      };

      res.status(200).json(information);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching film data" });
    });
});

app.post("/vote", async (req, res) => {
  let { groupCode, filmTitle } = req.body;

  try {
    let result = await pool.query(
      "SELECT * FROM votes WHERE group_code = $1 AND film_title = $2",
      [groupCode, filmTitle]
    );

    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE votes SET votes = votes + 1 WHERE group_code = $1 AND film_title = $2",
        [groupCode, filmTitle]
      );
    } else {
      await pool.query(
        "INSERT INTO votes (group_code, film_title, votes) VALUES ($1, $2, 1)",
        [groupCode, filmTitle]
      );
    }

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ message: "Error recording vote" });
  }
});

app.get("/votes/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      "SELECT film_title, votes FROM votes WHERE group_code = $1",
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
  console.log(`Numbers of members in room ${roomId}: ${Object.keys(rooms[roomId]).length}`);

  socket.on("sendMessageToRoom", ({message}) => {
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
