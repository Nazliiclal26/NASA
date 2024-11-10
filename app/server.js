let axios = require("axios");
let argon2 = require("argon2");
const pg = require("pg");
const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const app = express();
const path = require("path");

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
const group = require("../models/Group");
const messages = require("../models/Messages");

let { Server } = require("socket.io");
let io = new Server(server);

pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public", {index: false}));
app.use(express.json());
app.use(cookieParser());

// structure of "username": "cookie-token"
let tokenStorage = {};
tokenOptions = {
  httpOnly: true, 
  secure: true, 
  sameSite: "strict"
};

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// checking if login successful
app.post("/login", async (req, res) => {
  let {username, password} = req.body;

  console.log(username, password);

  if(!username.trim() || !password.trim()) {
    return res.json({status: "error", message: "Missing input"});
  }

  try{
    let result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]);

    if(result.rows.length === 0) {
      console.log("Invalid username or password");
      return res.json({status: "error", message: "Invalid username or password"});
    }

    let user = result.rows[0];
    let userHash = user.password;

    let match = await argon2.verify(userHash, password);

    if(match) {
      console.log("Login Success");
      tokenStorage[username] = makeToken();
      return res.cookie("token", tokenStorage[username], tokenOptions).json({status: "success", message: "Login Successful"});
    } else{
      console.log("Invalid username or password");
      return res.json({status: "error", message: "Invalid username or password"});
    }
    } catch (error) {
    console.error("Error logging in:", error);
  }
}
)

// adding new user in sign up page
app.post("/signUp", async (req, res) => {
  let {firstName, lastName, username, password, repeatPass} = req.body;
  let preferred_genres = ["horror"];

  console.log(firstName, lastName, username, password, repeatPass);

  try{
    let userCheck = await pool.query("SELECT 1 FROM users WHERE username = $1", [username]);
    if(!firstName.trim() || !lastName.trim() || !username.trim() || !password.trim() || !repeatPass.trim()) {
      return res.json({status: "error", message: "Missing input"});
    }else if(userCheck.rows.length > 0) {
      return res.json({status: "error", message: "Username no longer available"});
    }else if(password !== repeatPass) {
      return res.json({status: "error", message: "Passwords don't match"})
    }else{
      let hash = await argon2.hash(password);
      let result = await pool.query(
      "INSERT INTO users (first_name, last_name, username, password, preferred_genres) VALUES ($1, $2, $3, $4, $5)",
      [firstName, lastName, username, hash, preferred_genres]
      );
      let user = result.rows[0];
      tokenStorage[username] = makeToken();
      res.cookie("token", tokenStorage[username], tokenOptions).json({
        status: "success",
        message: "Sign Up Successful",
        userId: user.id,
      });
  }
  }catch (error) {
    console.error("Error signing up:", error);
  }

}
)

app.post("/create", (req, res) => {
  let groupCode = req.body.groupCode;

  if (!groupCode || groupCode.length !== 10) {
    return res.status(400).json({ message: "Invalid group code" });
  }
  res.status(200).json({ message: "Group created", groupCode });
});

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
        console.log(document.cookie);
        let username = null;
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
          // fetch('/addMessage', {
          //   method: 'POST',
          //   headers: {"content-type": "application/json"},
          //   body: JSON.stringify({})
          // });
          socket.emit('sendMessageToRoom', { message });
        });

        // Sets username based on token storage in server
        fetch('/getUsernameForGroup').then((response) => {
          return response.json();
        }).then((body) => {
          username = body["username"];
        }).catch((error) => {
          console.error(error);
        });

        fetch('/getMessages?groupName=${groupCode}').then((response) => {
          return response.json();
        }).then((body) => {
          displayExistingMessages(body);
        }).catch((error) => { console.error(error); });

        // Ideally you receive a username of who sent it, send a token, return the username
        socket.on("receive", (data) => {
          console.log("Received message:", data);
          appendReceivedMessage(data); 
        });
        
        function appendReceivedMessage(msg, defaultUser="") {
          let msgBox = document.createElement("li");
          msgBox.textContent = msg;
          msgBox.style.textAlign = "left";
          msgBox.style.listStyleType = "none";
          messages.appendChild(msgBox);
        }

        function appendSentMessage(msg, defaultUser="") {
          let msgBox = document.createElement("li");
          let usernameDiv = document.createElement("div");
          let usernameEffect = document.createElement("strong");
          usernameEffect.textContent = defaultUser;
          usernameDiv.appendChild(usernameEffect);
          let messageDiv = document.createElement("div");
          messageDiv.textContent = msg;
          msgBox.appendChild(usernameDiv);
          msgBox.appendChild(messageDiv);
          msgBox.style.textAlign = "right";
          msgBox.style.listStyleType = "none";
          messages.appendChild(msgBox);
        }

        function displayExistingMessages(body) {
          let sentUser = body["username"];
          // checks if global variable on whether to append to left 
          let messageCollection = body["messages"];
          for (let row of messageCollection) {
            if (sentUser === row["username"]) {
              appendSentMessage(row["user_message"], row["username"]);
            }
            else {
              appendReceivedMessage(row["user_message"], row["username"]);
            }
          }
        }

        // Add message to the database
        // function addMessage(msg) {
        //   // some sort of post fetch call to '/addMessage' message handler
        //   fetch();
        // }
      </script>
      </body>
      </html>
  `);
});


app.get('/getUsernameForGroup', (req, res) => {
  // Utilize cookies to return username
  let { token } = req.cookies;
  if (token === undefined) {
    console.log("No cookies set for this username.");
    return res.status(500).json({error: "No cookie set for this user, internal issue with user setup."});
  }
  else if (getKeyByValue(tokenStorage, token) === undefined) {
    console.log("Server storage not properly accounting for this username.");
    return res.status(400).json({error: "No cookie set for this user, ensure user was initialized properly."});
  }

  return res.status(200).json({username: getKeyByValue(tokenStorage, token)});
});

app.get('/getMessages', async (req, res) => {
  let groupName = req.query.groupName; 

  let { token } = req.cookies;
  if (token === undefined) {
    console.log("No cookies set for this username.");
    return res.status(500).json({error: "No cookie set for this user, internal issue with user setup."});
  }
  else if (getKeyByValue(tokenStorage, token) === undefined) {
    console.log("Server storage not properly accounting for this username.");
    return res.status(500).json({error: "No cookie set for this user, ensure user was initialized properly."});
  }
  else {
    console.log(token);
  }
  console.log("Received getMessages request, If works, i'll do the get key from value function and return the username");
  let username = getKeyByValue(tokenStorage, token);

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
    messages: messageCollection
  }
  // data gon be like { username: "username", messages: [{ username: "message" }] }
  console.log("Message data sending back to user", messageObj);
  return res.status(200).json(messageObj);
});

app.get("/groupSearch", (req, res) => {
  let title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Input Title" });
  }

  let url = `https://www.omdbapi.com/?t=${title}&apikey=${movieApiKey}`;

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


app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
