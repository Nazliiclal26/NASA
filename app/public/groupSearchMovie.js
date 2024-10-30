document.addEventListener("DOMContentLoaded", () => {
  let searchSection = document.getElementById("searchSection");
  let searchButton = document.getElementById("searchFilm");
  let searchResult = document.getElementById("searchResult");
  let votedFilmsList = document.getElementById("votedFilms");
  let groupCode = window.location.pathname.split("/").pop(); // Extract group code from URL
  let stopVoteButton = document.getElementById("stopVote");
  let startVoteButton = document.getElementById("startVote");
  let mostVotedFilmSection = document.getElementById("mostVotedFilm");

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
          <button class="vote-btn" data-title="${data.title}">+</button>
          <h3>${data.title}</h3>
          <p>IMDb Rating: ${data.rating}</p>
          <p>Genre: ${data.genre}</p>
          <p>Plot: ${data.plot}</p>
        </div>
      `;

      document.querySelector(".vote-btn").addEventListener("click", (e) => {
        const filmTitle = e.target.dataset.title;
        voteForFilm(filmTitle);
      });
    } catch (error) {
      searchResult.innerText = "Film not found or an error occurred.";
      console.error("Error fetching film:", error);
    }
  });

  async function voteForFilm(title) {
    try {
      const response = await fetch("/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, filmTitle: title })
      });

      if (!response.ok) throw new Error("Error voting");

      fetchVotes(); // Refresh the vote list
    } catch (error) {
      console.error("Error recording vote:", error);
    }
  }

  async function fetchVotes() {
    try {
      const response = await fetch(`/votes/${groupCode}`);
      if (!response.ok) throw new Error("Error fetching votes");

      const data = await response.json();
      votedFilmsList.innerHTML = ""; // Clear the list before repopulating

      data.forEach((film) => {
        if (film.votes > 0) {
          const li = document.createElement("li");
          li.textContent = `${film.film_title} - ${film.votes} votes`;
          votedFilmsList.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }

  stopVoteButton.addEventListener("click", async () => {
    const response = await fetch(`/votes/${groupCode}`);
    const data = await response.json();

    if (data.length === 0) {
      mostVotedFilmSection.innerHTML = "<p>No votes yet.</p>";
      return;
    }

    const mostVoted = data.reduce((a, b) => (a.votes > b.votes ? a : b));
    mostVotedFilmSection.innerHTML = `
      <h2>Most Voted Film</h2>
      <p>${mostVoted.film_title} with ${mostVoted.votes} votes!</p>
    `;

    searchSection.style.display = "none"; // Hide search section
  });

  startVoteButton.addEventListener("click", async () => {
    await fetch(`/clearVotes/${groupCode}`, { method: "DELETE" }); // Clear votes from the database

    searchSection.style.display = "block"; // Show search section again
    mostVotedFilmSection.innerHTML = ""; // Clear the most voted film section
    fetchVotes(); // Refresh vote list
  });

  fetchVotes(); // Fetch votes on page load
});
