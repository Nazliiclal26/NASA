let axios = require("axios");
let argon2 = require("argon2");
const pg = require("pg");
const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const http = require("http");
const app = express();

require("dotenv").config({ path: "../.env" });
let OMDB_API_KEY = process.env.OMDB_API_KEY;
let GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
let MOVIEDB_API_KEY = process.env.MOVIEDB_API_KEY;
let openAiApiKey = process.env.OPEN_AI_API_KEY;

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

//const authRoutes = require('../routes/authRoutes');
//const calendarRoutes = require('../routes/calendarRoutes');
//app.use('/calendar', calendarRoutes);

let { Server } = require("socket.io");
const { timeStamp } = require("console");
let io = new Server(server);

pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public", { index: false }));
app.use(express.json());
//app.use(authRoutes);
app.use(cookieParser());

// I'm gonna have still store old session information -
//  old sessions will be marked by inclusion of "timeLoggedOut" key-value pair
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

let bodyParser = require("body-parser");
let https = require("https");

app.use(bodyParser.json());

app.post("/votes/setMostVotedBook/", async (req, res) => {
  try {
    let { groupCode, book_title } = req.body;

    let existingWinner = await db.query(
      "SELECT * FROM votes WHERE group_code = $1 AND mostVotedFilm = TRUE",
      [groupCode]
    );

    if (existingWinner.rows.length > 0) {
      return res.status(200).json(existingWinner.rows[0]);
    }

    await db.query(
      "UPDATE votes SET mostVotedFilm = TRUE WHERE group_code = $1 AND book_title = $2",
      [groupCode, book_title]
    );

    let updatedFilm = await db.query(
      "SELECT * FROM votes WHERE group_code = $1 AND book_title = $2",
      [groupCode, book_title]
    );

    if (updatedFilm.rows.length > 0) {
      res.status(200).json(updatedFilm.rows[0]);
    } else {
      res.status(404).send("Book not found after update");
    }
  } catch (error) {
    console.error("Error setting most voted book:", error);
    res.status(500).send("Error setting most voted book");
  }
});

app.post("/votes/setMostVoted/", async (req, res) => {
  try {
    const { groupCode, film_title } = req.body;

    const existingWinner = await db.query(
      "SELECT * FROM votes WHERE group_code = $1 AND mostVotedFilm = TRUE",
      [groupCode]
    );

    if (existingWinner.rows.length > 0) {
      return res.status(200).json(existingWinner.rows[0]);
    }

    await db.query(
      "UPDATE votes SET mostVotedFilm = TRUE WHERE group_code = $1 AND film_title = $2",
      [groupCode, film_title]
    );

    let updatedFilm = await db.query(
      "SELECT * FROM votes WHERE group_code = $1 AND film_title = $2",
      [groupCode, film_title]
    );

    if (updatedFilm.rows.length > 0) {
      res.status(200).json(updatedFilm.rows[0]);
    } else {
      res.status(404).send("Film not found after update");
    }
  } catch (error) {
    console.error("Error setting most voted film:", error);
    res.status(500).send("Error setting most voted film");
  }
});

app.post("/movieGroup/recommend", (req, res) => {
  let { genres, mood, minRating, contentRating, movieType } = req.body;

  let messages = [
    {
      role: "system",
      content: "You are a helpful assistant that suggests movies.",
    },
    {
      role: "user",
      content: `Please provide 5 movie recommendations based on the following criteria:
                - Genres: ${genres}
                - Mood: ${mood}
                - Minimum IMDb Rating: ${minRating}
                - Content Rating: ${contentRating}
                - Movie Type: ${movieType}.
                Make sure the recommendations match these preferences.`,
    },
  ];

  let data = JSON.stringify({
    model: "gpt-4",
    messages: messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  let options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
  };

  let apiRequest = https.request(options, (apiResponse) => {
    let result = "";

    apiResponse.on("data", (chunk) => {
      result += chunk;
    });

    apiResponse.on("end", () => {
      try {
        res.send(result);
      } catch (error) {
        console.error("Error processing API response:", error);
        res.status(500).send("Error processing AI response");
      }
    });
  });

  apiRequest.on("error", (error) => {
    console.error("Error with OpenAI API request:", error);
    res.status(500).send("Error connecting to AI service");
  });

  apiRequest.write(data);
  apiRequest.end();
});

app.post("/bookGroup/recommend", (req, res) => {
  let {
    genre,
    mood,
    author,
    bookType,
    minRating,
    audience,
    minPages,
    maxPages,
  } = req.body;

  let messages = [
    {
      role: "system",
      content: "You are a helpful assistant that recommends books.",
    },
    {
      role: "user",
      content: `I need book recommendations based on the following:
                - Genre: ${genre}
                - Mood: ${mood}
                - Author: ${author || "No specific preference"}
                - Book Type: ${bookType}
                - Minimum Rating: ${minRating}
                - Target Audience: ${audience}
                - Page Count Range: ${minPages || "No minimum"} to ${
        maxPages || "No maximum"
      } pages.
                Please provide 5 recommendations that match these criteria.`,
    },
  ];

  let data = JSON.stringify({
    model: "gpt-4",
    messages: messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  let options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
  };

  let apiRequest = https.request(options, (apiResponse) => {
    let result = "";

    apiResponse.on("data", (chunk) => {
      result += chunk;
    });

    apiResponse.on("end", () => {
      try {
        res.send(result);
      } catch (error) {
        console.error("Error processing API response:", error);
        res.status(500).send("Error processing AI response");
      }
    });
  });

  apiRequest.on("error", (error) => {
    console.error("Error with OpenAI API request:", error);
    res.status(500).send("Error connecting to AI service");
  });

  apiRequest.write(data);
  apiRequest.end();
});

app.get("/getGroupWatchlistMovies/:groupCode", async (req, res) => {
  let { groupCode } = req.params;

  try {
    let groupWatchlistQuery = `
      SELECT DISTINCT item_id, item_type,poster
      FROM group_watchlists
      WHERE group_id = $1 and item_type = $2
    `;

    let result = await pool.query(groupWatchlistQuery, [groupCode, "movies"]);

    if (result.rows.length === 0) {
      console.log(`No items found for group_id: ${groupCode}`);
    } else {
      console.log(`Fetched ${result.rows.length} for ${groupCode}`);
    }

    res.status(200).json({ status: "success", items: result.rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error fetching group watchlist" });
  }
});

app.get("/getGroupWatchlistBooks/:groupCode", async (req, res) => {
  let { groupCode } = req.params;

  try {
    let groupWatchlistQuery = `
      SELECT DISTINCT item_id, item_type, poster
      FROM group_watchlists
      WHERE group_id = $1 and item_type = $2
    `;

    let result = await pool.query(groupWatchlistQuery, [groupCode, "books"]);

    if (result.rows.length === 0) {
      console.log(`No items found for group_id: ${groupCode}`);
    } else {
      console.log(`Fetched ${result.rows.length} for ${groupCode}`);
    }

    res.status(200).json({ status: "success", items: result.rows });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error fetching group watchlist" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/clearCookie", (req, res) => {
  let { token } = req.cookies;

  if (token == undefined) {
    return res.status(400).json({ message: "User not logged in yet" });
  }

  if (tokenStorage[token] == undefined) {
    return res.status(500).json({
      message: "Server issue, did not properly set cookie in local storage",
    });
  }

  let now = new Date();
  tokenStorage[token]["timeLoggedOut"] = now.toLocaleString();

  console.log(tokenStorage);
  return res
    .clearCookie("token", tokenOptions)
    .json({ message: "Cookie properly cleared" });
});

app.get("/checkCookie", (req, res) => {
  let { token } = req.cookies;

  // User has yet to log in
  if (token == undefined) {
    return res.status(200).json({ cookieExists: false });
  }
  // Clears up cookie from leftover session and creates new session instance
  // Only occurs after server restart - should clear cookie if server restarted
  else if (tokenStorage[token] == undefined) {
    return res
      .status(200)
      .clearCookie("token", tokenOptions)
      .json({ cookieExists: false });
  } else {
    returnedUserId = null;
    user.findByUsername(tokenStorage[token]["username"]).then((result) => {
      if (result.id) {
        returnedUserId = result.id;
        return res
          .status(200)
          .json({ cookieExists: true, userId: returnedUserId });
      } else {
        // Server issue
        return res.status(500);
      }
    });
  }
});

app.get("/:userId/watchlist.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "watchlist.html"));
});

app.post("/checkIfLeader", async (req, res) => {
  let body = req.body;
  if (!body.hasOwnProperty("userId") || !body.hasOwnProperty("group")) {
    return res
      .status(400)
      .json({ isLeader: null, message: "Improper body for fetch request" });
  }

  let id = parseInt(body.userId);
  let groupName = body.group;
  group
    .findByName(groupName)
    .then((result) => {
      // console.log(result);
      if (result.leader_id === id) {
        return res
          .status(200)
          .json({ isLeader: true, message: "User is leader" });
      } else {
        return res
          .status(200)
          .json({ isLeader: false, message: "User is not leader" });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ isLeader: null, message: "Server error" });
    });
});

app.post("/startVoting/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;
  let fullGroupName = `Group ${groupCode}`;

  try {
    let result = await pool.query(
      "UPDATE groups SET voting_status = FALSE WHERE group_name = $1 or group_name = $2",
      [groupCode, fullGroupName]
    );

    if (result.rowCount === 0) {
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

      let now = new Date();
      tokenStorage[token]["timeLoggedIn"] = now.toLocaleString();

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

      let now = new Date();
      tokenStorage[token]["timeLoggedIn"] = now.toLocaleString();

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

  async function syncUserWatchlistWithGroup(userId, groupName) {
    try {
      let userWatchlistQuery = await pool.query(
        "SELECT item_id, item_type, poster FROM user_watchlists WHERE user_id = $1",
        [userId]
      );

      let userWatchlist = userWatchlistQuery.rows;

      for (let item of userWatchlist) {
        await pool.query(
          "INSERT INTO group_watchlists (group_id, item_id, item_type, poster) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
          [groupName, item.item_id, item.item_type, item.poster]
        );
      }

      console.log(`Synced ${userWatchlist.length} items to group ${groupName}`);
    } catch (error) {
      console.error("Error syncing user watchlist with group:", error);
    }
  }

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

      await syncUserWatchlistWithGroup(leaderId, groupName);
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

  async function syncUserWatchlistWithGroup(userId, groupId) {
    try {
      let groupQuery = await pool.query(
        "SELECT group_name FROM groups WHERE id = $1",
        [groupId]
      );

      if (groupQuery.rows.length === 0) {
        console.error(`No group found with id: ${groupId}`);
        return;
      }

      let groupName = groupQuery.rows[0].group_name;

      let userWatchlistQuery = await pool.query(
        "SELECT item_id, item_type, poster FROM user_watchlists WHERE user_id = $1",
        [userId]
      );

      let userWatchlist = userWatchlistQuery.rows;

      for (const item of userWatchlist) {
        await pool.query(
          "INSERT INTO group_watchlists (group_id, item_id, item_type, poster) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
          [groupName, item.item_id, item.item_type, item.poster]
        );
      }

      console.log(`Synced ${userWatchlist.length} items to group ${groupName}`);
    } catch (error) {
      console.error("Error syncing user watchlist with group:", error);
    }
  }

  if (type === "code") {
    try {
      if (!code || !userId) {
        console.log("error 1");
        return res
          .status(400)
          .json({ status: "error", message: "missing code or userId" });
      }

      let groupCheck = await pool.query(
        "SELECT * FROM groups WHERE secret_code = $1",
        [code]
      );

      if (groupCheck.rows.length === 0) {
        console.log("error 2");
        return res
          .status(404)
          .json({ status: "error", message: "group not found" });
      }

      let group = groupCheck.rows[0];

      if (group.members && group.members.includes(userId)) {
        console.log("error 2");
        return res
          .status(400)
          .json({ status: "error", message: "user already in group" });
      }

      if (group.privacy !== "private") {
        console.log("error 1");
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

        await syncUserWatchlistWithGroup(userId, group.id);
        res.status(200).json({
          status: "success",
          message: "joined group",
          group: updateRes.rows[0],
        });
      } else {
        if (code !== group.secret_code) {
          console.error("Error joining group:", error);
          res.status(500).json({ message: "Wrong code" });
        } else {
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

          await syncUserWatchlistWithGroup(userId, group.id);

          res.status(200).json({
            status: "success",
            message: "joined group",
            group: updateRes.rows[0],
          });
        }
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

      await syncUserWatchlistWithGroup(userId, group.id);
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

app.get("/getGroupInfo", (req, res) => {
  let { name } = req.query;
  if (name === undefined) {
    return res.status(400).json({});
  }

  group
    .findByName(name)
    .then((body) => {
      return res.status(200).json(body);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({});
    });
});

// Adding client-side room functionality here - is called upon redirect to 'group/:groupId' in movies.js
app.get("/movieGroup/:groupCode", async (req, res) => {
  const groupCode = req.params.groupCode;
  let name = "";

  // With the group name, select the secret code

  // try {
  //   let result = await pool.query(
  //     "SELECT * FROM groups WHERE secret_code = $1",
  //     [groupCode.substring(1)]
  //   );
  //   name = groupCode;
  // } catch (error) {
  //   console.log(error);
  // }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Group ${groupCode}</title>
      <script src="/groupSearchMovie.js" defer></script>
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
        <select id="searchMovieType">
          <option value="title">Title</option>
          <option value="imdbId">IMDb ID</option>
        </select>
        <div id="searchSection" style="display: flex;">
          <input type="text" id="searchValue" placeholder="Search for a film...">
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
              <button id="reassign">Reassign Leader</button>
              <button id="membersButton">Members</button>
              <div id="membersListWrapper"> 
                <ul id="membersList"></ul>
              </div>
            </div>
          </div>
          <div id="votingBox">
            <div>
          <h2 id="votedFilmsTitle" >Voted Films</h2>
          <ul id="votedFilms"></ul>
        </div>

        <div id="mostVotedFilm"></div>
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
                  <ul id="groupWatchlist" ></ul>
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
      <form id="suggestionsForm">
      <label for="genres">Genres:</label>
      <select id="genres" required>
        <option value="">Select Genre</option>
        <option value="Anything">Anything</option>
        <option value="Action">Action</option>
        <option value="Adventure">Adventure</option>
        <option value="Comedy">Comedy</option>
        <option value="Drama">Drama</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Horror">Horror</option>
        <option value="Mystery">Mystery</option>
        <option value="Romance">Romance</option>
        <option value="Sci-Fi">Sci-Fi</option>
        <option value="Thriller">Thriller</option>
      </select>
    
      <label for="mood">Mood:</label>
      <select id="mood" required>
        <option value="">Select Mood</option>
        <option value="Anything">Anything</option>
        <option value="Happy">Happy</option>
        <option value="Exciting">Exciting</option>
        <option value="Romantic">Romantic</option>
        <option value="Thrilling">Thrilling</option>
        <option value="Scary">Scary</option>
        <option value="Adventurous">Adventurous</option>
        <option value="Calm">Calm</option>
        <option value="Dramatic">Dramatic</option>
        <option value="Mysterious">Mysterious</option>
        <option value="Funny">Funny</option>
        <option value="Uplifting">Uplifting</option>
        <option value="Heartbreaking">Heartbreaking</option>
      </select>
    
      <label for="minRating">Minimum IMDb Rating:</label>
      <select id="minRating" required>
        <option value="">Select Rating</option>
        <option value="Anything">Anything</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
      </select>
    
      <label for="contentRating">Content Rating:</label>
      <select id="contentRating" required>
        <option value="">Select Content Rating</option>
        <option value="Anything">Anything</option>
        <option value="G">G - General Audience</option>
        <option value="PG">PG - Parental Guidance</option>
        <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
        <option value="R">R - Restricted</option>
        <option value="NC-17">NC-17 - Adults Only</option>
      </select>
    
      <label for="movieType">Movie Type:</label>
      <select id="movieType" required>
        <option value="">Select Movie Type</option>
        <option value="Anything">Anything</option>
        <option value="Mainstream">Mainstream</option>
        <option value="Indie">Indie</option>
        <option value="Documentary">Documentary</option>
        <option value="Short Film">Short Film</option>
        <option value="Animated">Animated</option>
        <option value="Foreign">Foreign</option>
        <option value="Classic">Classic</option>
      </select>
    
      <button type="submit">Get Recommendations</button>
    </form>
    
    <div id="suggestionsResult"></div>    
      </main>
      <script src="/socket.io/socket.io.js"></script>
      <script src="/new.js"></script>
       <script src="/navbar.js"></script>
    </body>
    </html>
  `);
});

app.get("/bookGroup/:groupCode", async (req, res) => {
  const groupCode = req.params.groupCode;
  let name = "";

  // With the group name, select the secret code

  // try {
  //   let result = await pool.query(
  //     "SELECT * FROM groups WHERE secret_code = $1",
  //     [groupCode.substring(1)]
  //   );
  //   name = groupCode;
  // } catch (error) {
  //   console.log(error);
  // }

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
        <select id="searchBookType">
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="isbn">ISBN</option>
        </select>
        <div id="searchSection" style="display: flex;">
          <input type="text" id="searchValue" placeholder="Search for a book...">
          <button id="searchBook">Search</button>
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
              <button id="reassign">Reassign Leader</button>
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
                  <ul id="groupWatchlist"></ul>
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
      <form id="bookSuggestionsForm">
  <label for="bookGenre">Genre:</label>
  <select id="bookGenre" required>
    <option value="">Select Genre</option>
    <option value="Anything">Anything</option>
    <option value="Fiction">Fiction</option>
    <option value="Non-Fiction">Non-Fiction</option>
    <option value="Fantasy">Fantasy</option>
    <option value="Mystery">Mystery</option>
    <option value="Romance">Romance</option>
    <option value="Thriller">Thriller</option>
    <option value="Science Fiction">Science Fiction</option>
    <option value="Biography">Biography</option>
    <option value="Self-Help">Self-Help</option>
    <option value="Young Adult">Young Adult</option>
    <option value="Historical">Historical</option>
    <option value="Horror">Horror</option>
  </select>

  <label for="bookMood">Mood:</label>
  <select id="bookMood" required>
    <option value="">Select Mood</option>
    <option value="Anything">Anything</option>
    <option value="Uplifting">Uplifting</option>
    <option value="Dark">Dark</option>
    <option value="Light-Hearted">Light-Hearted</option>
    <option value="Inspiring">Inspiring</option>
    <option value="Romantic">Romantic</option>
    <option value="Suspenseful">Suspenseful</option>
    <option value="Adventurous">Adventurous</option>
    <option value="Thought-Provoking">Thought-Provoking</option>
    <option value="Mysterious">Mysterious</option>
  </select>

  <label for="author">Author:</label>
  <input type="text" id="author" placeholder="e.g., J.K. Rowling" />

  <label for="bookType">Book Type:</label>
  <select id="bookType" required>
    <option value="">Select Book Type</option>
    <option value="Anything">Anything</option>
    <option value="Novel">Novel</option>
    <option value="Short Stories">Short Stories</option>
    <option value="Anthology">Anthology</option>
    <option value="Graphic Novel">Graphic Novel</option>
    <option value="Poetry">Poetry</option>
    <option value="Memoir">Memoir</option>
  </select>

  <label for="minRating">Minimum Rating:</label>
  <select id="minRating" required>
    <option value="">Select Rating</option>
    <option value="Anything">Anything</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
  </select>

  <label for="audience">Target Audience:</label>
  <select id="audience" required>
    <option value="">Select Audience</option>
    <option value="Anything">Anything</option>
    <option value="Children">Children</option>
    <option value="Teens">Teens</option>
    <option value="Adults">Adults</option>
    <option value="All Ages">All Ages</option>
  </select>

  <label for="minPages">Minimum Pages:</label>
  <input type="number" id="minPages" placeholder="e.g., 100" />

  <label for="maxPages">Maximum Pages:</label>
  <input type="number" id="maxPages" placeholder="e.g., 500" />

  <button type="submit">Get Recommendations</button>
</form>

<div id="bookSuggestionsResult"></div>
      </main>
      <script src="/socket.io/socket.io.js"></script>
      <script src="/new.js"></script>
       <script src="/navbar.js"></script>
    </body>
    </html>
  `);
});

app.get("/getGroupMembers", async (req, res) => {
  const groupName = req.query.groupName;
  if (!groupName) {
    return res.status(400).json({ message: "Group name is required" });
  }

  try {
    const groupQuery = await pool.query(
      "SELECT members, leader_id FROM groups WHERE group_name = $1",
      [groupName]
    );

    if (groupQuery.rows.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Extract member IDs and convert them to integers
    //const { members, leader_id } = groupQuery.rows[0].members.map(id => parseInt(id));
    const { members, leader_id } = groupQuery.rows[0];

    // Query user details based on these IDs
    const usersQuery = await pool.query(
      "SELECT id, username FROM users WHERE id = ANY($1::int[])",
      [members]
    );

    const membersList = usersQuery.rows.map((user) => ({
      username: user.username,
      is_leader: user.id === leader_id,
    }));

    res.json({ members: membersList });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/addMessage", async (req, res) => {
  // console.log(req.body);
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

  // console.log(
  //   "Attempting to add message:",
  //   message,
  //   ", in group",
  //   groupName,
  //   ", to db"
  // );

  let groupId = null;
  await group
    .findByName(groupName)
    .then((body) => {
      groupId = body.id; // Returns a singular row from group table so we just pass the id
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Server error finding group by name" });
    });

  let userId = null;
  await user
    .findByUsername(sentUser)
    .then((body) => {
      userId = body.id;
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Server error finding user who sent message by name" });
    });

  let result = false;
  await messages
    .add(groupId, userId, message)
    .then((body) => {
      result = true;
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Server error adding message to database" });
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
  console.log("THIS IS COOKIES" + req.cookies);
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
  }

  let username = tokenStorage[token]["username"];

  // Get group id given group name
  let groupId = null;
  await group
    .findByName(groupName)
    .then((body) => {
      groupId = body.id; // Returns a singular row from group table so we just pass the id
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({});
    });
  // Get messages by group id
  let messageCollection = {};
  await messages
    .getMessagesByGroupId(groupId)
    .then((rows) => {
      messageCollection = rows;
    })
    .catch((error) => {
      console.log(error);

      return res.status(500).json({});
    });
  // Create message object
  let messageObj = {
    username: username,
    messages: messageCollection,
  };
  // data gon be like { username: "username", messages: [{ username: "message" }] }
  return res.status(200).json(messageObj);
});

app.get("/deleteGroup", async (req, res) => {
  let { id } = req.query;
  if (id === null || id === undefined) {
    return res.status(400).json({
      message: "The query does not contain a group id to delete.",
    });
  }

  await messages
    .deleteMessagesGivenGroup(id)
    .then((body) => {
      console.log("Group messages have been deleted for group id", id);
    })
    .catch((error) => {
      console.error("Issue with deleting messages for given group id");
      return res
        .status(500)
        .json({ message: "Server with deleting messages for given group id" });
    });
  await group
    .deleteGroup(id)
    .then((body) => {
      // console.log(body);
      return res
        .status(200)
        .json({ message: "Group has been successfully deleted." });
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get("/getMembersFromIDs", async (req, res) => {
  let { members } = req.query;
  if (members === null || members === undefined) {
    return res.status(400).json({
      message: "The query does not contain a members to return usernames from.",
    });
  }

  await user
    .getUsernamesFromIDs(members)
    .then((result) => {
      return res.status(200).json({
        usernames: result,
        message: "Group usernames have been successfully returned",
      });
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Internal server issue." });
    });
});

app.get("/catalogSearchNewApi", (req, res) => {
  let id = req.query.id;

  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${MOVIEDB_API_KEY}&with_genres=${id}`;

  axios
    .get(url)
    .then((response) => {
      let data = response.data.results.slice(0, 5);

      // console.log(data);

      if (data.Response === "False") {
        return res.status(404).json({ message: "Film not found" });
      }

      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching film data" });
    });
});

app.get("/groupSearch", (req, res) => {
  let title = req.query.title;

  if (!title) {
    return res.status(400).json({ message: "Input Title" });
  }

  let url = `https://www.omdbapi.com/?t=${title}&apikey=${OMDB_API_KEY}`;

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

app.get("/movieSearchById", (req, res) => {
  let imdbId = req.query.imdbId;
  let url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
  axios
    .get(url)
    .then((response) => {
      let data = response.data;
      console.log(data); // Log the response data for debugging

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
      console.error("Error fetching film data:", error);
      res.status(500).json({ message: "Error fetching film data" });
    });
});

app.post("/vote", async (req, res) => {
  let { groupCode, filmTitle, poster, filmGenre, userId } = req.body;

  try {
    let existingVote = await pool.query(
      "SELECT * FROM votes WHERE group_code = $1 AND user_id = $2",
      [groupCode, userId]
    );

    if (existingVote.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already voted in this group." });
    }

    await pool.query(
      "INSERT INTO votes (group_code, film_title, poster, num_votes, film_genre, user_id) VALUES ($1, $2, $3, 1, $4,$5)",
      [groupCode, filmTitle, poster, filmGenre, userId]
    );

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error recording vote" });
  }
});

app.get("/votes/:groupCode", async (req, res) => {
  const { groupCode } = req.params;

  try {
    const result = await pool.query(
      `SELECT film_title, book_title, SUM(num_votes) AS num_votes, film_genre, poster
       FROM votes
       WHERE group_code = $1
       GROUP BY film_title, book_title, film_genre,poster`,
      [groupCode]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching votes:", error);
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

app.post("/removeMemberFromGroup", async (req, res) => {
  let { userId, groupId } = req.body;
  if (userId === null || userId === undefined) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "userId is missing" });
  }

  if (groupId === null || groupId === undefined) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "groupId is missing" });
  }

  await group
    .removeMember(userId, groupId)
    .then((body) => {
      return res.status(200).json({ isSuccess: true, message: "" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        isSuccess: false,
        message: "Server error in removing user from group",
      });
    });
});

app.post("/updateLeader", async (req, res) => {
  let { username, groupId } = req.body;
  if (username === null || username === undefined) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "username is missing" });
  }

  // Get userId from username
  let userId = null;
  await user
    .findByUsername(username)
    .then((body) => {
      userId = body.id;
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        isSuccess: false,
        message: `Server issue getting user id from username ${username}`,
      });
    });

  // Should occur under catch but still
  if (userId == null) {
    return res.status(500).json({
      isSuccess: false,
      message: `Server issue getting user id from username ${username}`,
    });
  }

  if (groupId === null || groupId === undefined) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "groupId is missing" });
  }

  await group
    .updateLeader(groupId, userId)
    .then((body) => {
      return res.status(200).json({ isSuccess: true, message: "" });
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(500)
        .json({ isSuccess: true, message: "Server issue updating leader" });
    });
});

app.get("/bookVotes/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      `SELECT book_title, SUM(num_votes) AS num_votes, poster
       FROM votes
       WHERE group_code = $1
       GROUP BY book_title, poster`,
      [groupCode]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching book votes:", error);
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
  )}&key=${GOOGLE_API_KEY}`;

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
        rating: book.averageRating,
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

app.get("/bookSearchByAuthor", (req, res) => {
  let author = req.query.author;

  if (!author) {
    return res.status(400).json({ message: "Input author" });
  }

  let url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(
    author
  )}
  &key=${GOOGLE_API_KEY}`;

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
        rating: book.averageRating,
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

app.get("/bookSearchByISBN", (req, res) => {
  let isbn = req.query.isbn;

  if (!isbn) {
    return res.status(400).json({ message: "Input ISBN" });
  }

  let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
    isbn
  )}
  &key=${GOOGLE_API_KEY}`;

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
        rating: book.averageRating,
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
  let { groupCode, bookTitle, poster, userId } = req.body;

  try {
    let existingVote = await pool.query(
      "SELECT * FROM votes WHERE group_code = $1 AND user_id = $2",
      [groupCode, userId]
    );

    if (existingVote.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already voted in this group." });
    }

    await pool.query(
      "INSERT INTO votes (group_code, book_title, poster, num_votes, film_title, user_id) VALUES ($1, $2, $3, 1, '', $4)",
      [groupCode, bookTitle, poster, userId]
    );

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error recording vote" });
  }
});

app.get("/votesBook/:groupCode", async (req, res) => {
  let groupCode = req.params.groupCode;

  try {
    let result = await pool.query(
      "SELECT book_title, poster, num_votes FROM votes WHERE group_code = $1",
      [groupCode]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching votes" });
  }
});

app.post("/addToWatchlist", async (req, res) => {
  let { type, title, userId, poster } = req.body;

  try {
    let checkWatch = await pool.query(
      "SELECT * FROM user_watchlists WHERE item_type = $1 AND item_id = $2 AND user_id = $3 AND poster = $4",
      [type, title, userId, poster]
    );

    if (checkWatch.rows.length > 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Item already in watchlist" });
    }

    let result = await pool.query(
      "INSERT INTO user_watchlists (item_type, item_id, user_id, poster) VALUES ($1, $2, $3, $4)",
      [type, title, userId, poster]
    );

    let groupsQuery = await pool.query(
      "SELECT id,group_name FROM groups WHERE $1 = ANY(members)",
      [userId]
    );

    let groups = groupsQuery.rows;

    for (let group of groups) {
      await pool.query(
        "INSERT INTO group_watchlists (group_id, item_id, item_type,poster) VALUES ($1, $2, $3,$4) ON CONFLICT DO NOTHING",
        [group.group_name, title, type, poster]
      );
    }

    res.status(200).json({ status: "success", message: "Adding to watchlist" });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error adding to watchlist" });
  }
});

app.get("/getWatchlist/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM user_watchlists WHERE user_id = $1",
      [userId]
    );
    res.json({ status: "success", items: result.rows });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error fetching watchlist" });
  }
});

app.post("/removeFromWatchlist", async (req, res) => {
  const { title, userId } = req.body;
  try {
    const result = await pool.query(
      "DELETE FROM user_watchlists WHERE item_id = $1 AND user_id = $2",
      [title, userId]
    );

    let groupsQuery = await pool.query(
      "SELECT id,group_name FROM groups WHERE $1 = ANY(members)",
      [userId]
    );

    let groups = groupsQuery.rows;

    for (let group of groups) {
      await pool.query(
        `DELETE FROM group_watchlists WHERE ctid IN (
          SELECT ctid 
          FROM group_watchlists 
          WHERE item_id = $1 AND group_id = $2
          LIMIT 1
        )`,
        [title, group.group_name]
      );
    }

    if (result.rowCount > 0) {
      res.json({ status: "success", message: "Item removed successfully" });
    } else {
      res.status(404).json({ status: "error", message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error removing item" });
  }
});

/* SOCKET FUNCTIONALITY */
// The key:value pairs of Rooms has the structure: { "groupId" : {socketId : socket} }
let rooms = {};

io.on("connection", (socket) => {
  console.log("Socket ", socket.id, " has been connected.");
  //console.log("Adding socket to room...");

  let url = socket.handshake.headers.referer;
  let pathParts = url.split("/");
  let roomId = pathParts[pathParts.length - 1];

  if (!rooms.hasOwnProperty(roomId)) {
    rooms[roomId] = {};
    console.log("Socket room for Room id", roomId, "has been created");
  }

  rooms[roomId][socket.id] = socket;
  // console.log(
  //   `Numbers of members in room ${roomId}: ${Object.keys(rooms[roomId]).length}`
  // );

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

const db = require("../config/db");

// Endpoint to add an event
app.post("/api/addEvent", async (req, res) => {
  const { groupCode, eventDate, eventTitle, description } = req.body;

  // Debugging: Log received data
  console.log("Received data on server:", {
    groupCode,
    eventDate,
    eventTitle,
    description,
  });

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
