let axios = require("axios");
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
