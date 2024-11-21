document.addEventListener("DOMContentLoaded", async () => {
  let searchSection = document.getElementById("searchSection");
  let searchButton = document.getElementById("searchFilm");
  let searchResult = document.getElementById("searchResult");
  let votedFilmsList = document.getElementById("votedFilms");
  let groupCode = decodeURIComponent(window.location.pathname).split("/").pop(); 
  let stopVoteButton = document.getElementById("stopVote");
  let startVoteButton = document.getElementById("startVote");
  let mostVotedFilmSection = document.getElementById("mostVotedFilm");

  async function fetchGroupWatchlist() {
    try {
      let response = await fetch(`/getGroupWatchlistMovies/${groupCode}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch group watchlist: ${response.statusText}`);
      }
  
      let data = await response.json();
  
      if (data.status === "success") {
        let groupItems = data.items;
  
        groupWatchlist.innerHTML = "";
  
        groupItems.forEach(item => {
          let li = document.createElement("li");
          li.style = "margin-bottom: 20px;";
  
          let div = document.createElement("div");
          let img = document.createElement("img");
          let title = document.createElement("div");
  
          if (item.poster) {
            img.src = item.poster;
            img.alt = `${item.item_id} poster`;
            img.style = "width: 100px; height: auto;";
            div.appendChild(img);
          }
  
          title.textContent = item.item_id;
          div.appendChild(title);
          li.appendChild(div);
  
          groupWatchlist.appendChild(li);
        });
      } else {
        groupWatchlist.innerHTML = "<p>No items in group watchlist.</p>";
      }
    } catch (error) {
      console.error("Error fetching group watchlist:", error);
    }
  }
  
  fetchGroupWatchlist();
  
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
        body: JSON.stringify({ groupCode, filmTitle: title, poster: poster, filmGenre: film_genre,userId: localStorage.getItem("userId") }) 
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
          li.innerHTML = `${film.film_title || film.book_title} - ${film.num_votes} votes - <span style="color: blue;">${film.film_genre || "N/A"}</span>`;
          votedFilmsList.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }

  async function checkIfLeader() {
    const response = await fetch(`/checkIfLeader`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({userId: localStorage.getItem("userId"), group: groupCode})
    });
    let data = await response.json();
    console.log(data.message);
    if (data.isLeader && response.ok) {
      document.getElementById("buttonContainer").style.display = "block";
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
  checkIfLeader(); 
});

let groupCode = decodeURIComponent(window.location.pathname).split("/").pop();
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

  // Add to successful return body for add message fetch
  // appendSentMessage(message, username);

  console.log("Sending message:", message);
  fetch('/addMessage', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sentUser: username,
      message: message,
      groupName: groupCode 
    })
  }).then((response) => {
    console.log(response);
    return response.json().then((body) => {
        console.log('Successful message addition. Now appending and sending to room:');
        appendSentMessage(message, username);
        socket.emit('sendMessageToRoom', { message, username });
        input.value = '';
      }).catch((error) => {
        console.error(error);
      }); 
  }).catch((error) => {
    console.error(error);
  });

  // Add this to successful return body for add message fetch
  // socket.emit('sendMessageToRoom', { message });
});

// Sets username based on token storage in server
fetch('/getUsernameForGroup').then((response) => {
  return response.json();
}).then((body) => {
  username = body["username"];
}).catch((error) => {
  console.error(error);
});

fetch(`/getMessages?groupName=${groupCode}`).then((response) => {
  return response.json();
}).then((body) => {
  displayExistingMessages(body);
}).catch((error) => { console.error(error); });

// Ideally you receive a username of who sent it, send a token, return the username
socket.on("receive", (data, userWhoSent) => {
  console.log("Received message:", data, "from:", userWhoSent);
  appendReceivedMessage(data, userWhoSent); 
});

function appendReceivedMessage(msg, defaultUser="") {
  let msgBox = document.createElement("li");
  let usernameDiv = document.createElement("div");
  let usernameEffect = document.createElement("strong");
  usernameEffect.textContent = defaultUser;
  usernameDiv.appendChild(usernameEffect);
  let messageDiv = document.createElement("div");
  messageDiv.textContent = msg;
  msgBox.appendChild(usernameDiv);
  msgBox.appendChild(messageDiv);
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
