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
  let groupCode = req.params.groupCode;

  res.send(`
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Group ${groupCode}</title>
      <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
      <script src="/groupSearch.js" defer></script>
    </head>
    <body>
      <header>
        <h1>Welcome!</h1>
        <h1>This is group ${groupCode}</h1>
      </header>
      <main>
        <div>
          <h2>Search for a Film</h2>
          <input type="text" id="searchTitle" placeholder="Title">
          <button id="searchFilm">Search</button>
          <div id="searchResult"></div>
        </div>
        <a href="/">Back to Home</a>
      </main>
    </body>
    </html>
  `);
});


app.get("/groupSearch", async (req, res) => {
  let title = req.query.title;
  console.log("Request received for title:", title); // Log when the request is received

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    console.log("Making API request to OMDb API..."); // Log before the API request

    const response = await axios.get(`https://www.omdbapi.com/`, {
      params: {
        t: title,
        apikey: "INPUT FROM OUR DOC"
      }
    });

    console.log("OMDb API Response:", response.data); // Log the API response

    let data = response.data;

    if (data.Response === "False") {
      return res.status(404).json({ message: "Film not found" });
    }

    const filmInfo = {
      title: data.Title,
      poster: data.Poster,
      rating: data.imdbRating
    };

    res.status(200).json(filmInfo);
  } catch (error) {
    console.error("Error fetching film:", error);
    res.status(500).json({ message: "Error fetching film data" });
  }
});


app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
