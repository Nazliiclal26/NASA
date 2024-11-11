document.addEventListener("DOMContentLoaded", async () => {
  let searchSection = document.getElementById("searchSection");
  let searchButton = document.getElementById("searchFilm");
  let searchResult = document.getElementById("searchResult");
  let votedFilmsList = document.getElementById("votedFilms");
  let groupCode = window.location.pathname.split("/").pop(); 
  let stopVoteButton = document.getElementById("stopVote");
  let startVoteButton = document.getElementById("startVote");
  let mostVotedFilmSection = document.getElementById("mostVotedFilm");
  
  try {
    let votingStatusResponse = await fetch(`/getVotingStatus/${groupCode}`);
    let { votingStatus } = await votingStatusResponse.json();

    if (votingStatus) {
      console.log("hereeee");
      await displayMostVotedFilm();
      searchSection.style.display = "none";
    } else {
      searchSection.style.display = "block";
    }
  } catch (error) {
    console.error("Error initializing page:", error);
  }
  
  async function displayMostVotedFilm() {
    try {
      let response = await fetch(`/votes/${groupCode}`);
      if (response.ok) {
        let data = await response.json();
        if (data.length > 0) {
          let mostVoted = data.reduce((a, b) => (a.num_votes > b.num_votes ? a : b));
          mostVotedFilmSection.innerHTML = `
            <h2>Most Voted Film</h2>
            <p>${mostVoted.film_title} with ${mostVoted.num_votes} votes!</p>
            <p>${mostVoted.film_genre}</p>
            <img src="${mostVoted.poster}" alt="${mostVoted.film_title} poster" style="max-width: 200px;">
          `;
        } else {
          mostVotedFilmSection.innerHTML = "<p>No votes yet.</p>";
        }
      }
    } catch (error) {
      console.error("Error fetching the most voted film:", error);
    }
  }

  searchButton.addEventListener("click", async () => {
    const title = document.getElementById("searchTitle").value;

    if (!title) {
      searchResult.innerText = "Please enter a film title.";
      return;
    }

    try {
      const response = await fetch(`/groupSearch?title=${encodeURIComponent(title)}`);
      if (!response.ok) throw new Error("Film not found");

      const data = await response.json();
      searchResult.innerHTML = `
        <div class="film-card">
          <img src="${data.poster}" alt="${data.title} poster">
          <button class="vote-btn" data-title="${data.title}" data-genre="${data.genre}">+</button>
          <h3>${data.title}</h3>
          <p>IMDb Rating: ${data.rating}</p>
          <p>Genre: ${data.genre}</p>
          <p>Plot: ${data.plot}</p>
        </div>
      `;

      document.querySelector(".vote-btn").addEventListener("click", (e) => {
        let filmTitle = e.target.dataset.title;
        let film_genre = e.target.dataset.genre;
        let poster = e.target.closest('.film-card').querySelector('img').src; 
        voteForFilm(filmTitle, poster, film_genre);
      });
    } catch (error) {
      searchResult.innerText = "Film not found or an error occurred.";
      console.error("Error fetching film:", error);
    }
  });

  async function voteForFilm(title, poster, film_genre) {
    try {
      const response = await fetch("/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, filmTitle: title, poster: poster, filmGenre: film_genre }) 
      });
  
      if (!response.ok) throw new Error("Error voting");
  
      fetchVotes(); 
    } catch (error) {
      console.error("Error recording vote:", error);
    }
  }

  async function fetchVotes() {
    try {
      const response = await fetch(`/votes/${groupCode}`);
      if (!response.ok) throw new Error("Error fetching votes");

      const data = await response.json();
      votedFilmsList.innerHTML = ""; 

      data.forEach((film) => {
        if (film.num_votes > 0) {
          const li = document.createElement("li");
          li.innerHTML = `${film.film_title} - ${film.num_votes} votes - <span style="color: blue;">${film.film_genre}</span>`;
          votedFilmsList.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }

  stopVoteButton.addEventListener("click", async () => {
    try {
      await fetch(`/stopVoting/${groupCode}`, { method: "POST", headers: { "Content-Type": "application/json" } });
      await displayMostVotedFilm(); 
      searchSection.style.display = "none";
    } catch (error) {
      console.error("Error stopping voting:", error);
    }
  });

  startVoteButton.addEventListener("click", async () => {
    try {
      await fetch(`/clearVotes/${groupCode}`, { method: "DELETE" });
      await fetch(`/startVoting/${groupCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
  
      searchSection.style.display = "block";
      mostVotedFilmSection.innerHTML = "";
      fetchVotes(); 
    } catch (error) {
      console.error("Error starting voting:", error);
    }
  });

  fetchVotes(); 
});
