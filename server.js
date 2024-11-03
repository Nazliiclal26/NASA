let axios = require("axios");
let argon2 = require("argon2");
const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);

pool.connect().then(() => {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());

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
      return res.json({status: "success", message: "Login Successful"});
    }else{
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
    )
    res.json({status: "success", message: "Sign Up Successful"})
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
      </main>
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


app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
