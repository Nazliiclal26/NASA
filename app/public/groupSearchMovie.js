document.addEventListener("DOMContentLoaded", async () => {
  let searchSection = document.getElementById("searchSection");
  let searchButton = document.getElementById("searchFilm");
  let searchResult = document.getElementById("searchResult");
  let votedFilmsList = document.getElementById("votedFilms");
  let groupCode = decodeURIComponent(window.location.pathname).split("/").pop();
  let stopVoteButton = document.getElementById("stopVote");
  let startVoteButton = document.getElementById("startVote");
  let mostVotedFilmSection = document.getElementById("mostVotedFilm");
  let leaveGroupButton = document.getElementById("leaveGroup");

  async function fetchGroupWatchlist() {
    try {
      let response = await fetch(`/getGroupWatchlistMovies/${groupCode}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch group watchlist: ${response.statusText}`
        );
      }

      let data = await response.json();

      if (data.status === "success") {
        let groupItems = data.items;

        groupWatchlist.innerHTML = "";

        groupItems.forEach((item) => {
          let li = document.createElement("li");
          li.style = "margin-bottom: 20px;";

          let div = document.createElement("div");
          let img = document.createElement("img");
          let title = document.createElement("div");

          div.className = "centering";

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
      searchSection.style.display = "flex";
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
          let mostVoted = data.reduce((a, b) =>
            a.num_votes > b.num_votes ? a : b
          );
          votedFilmsList.innerHTML = "";

          mostVotedFilmSection.innerHTML = `
          <div class="winnerOuter">
            <div class="winnerContext">
              <h2>Most Voted Film</h2>
              <p>${mostVoted.film_title} with ${mostVoted.num_votes} votes!</p>
              <p>${mostVoted.film_genre}</p>
            </div>
            <img id="winnerPoster" src="${mostVoted.poster}" alt="${mostVoted.film_title} poster" style="max-width: 200px;">
          </div>
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
      const response = await fetch(
        `/groupSearch?title=${encodeURIComponent(title)}`
      );
      if (!response.ok) throw new Error("Film not found");

      const data = await response.json();
      searchResult.innerHTML = `
        <div class="film-card">
          <img src="${data.poster}" alt="${data.title} poster">
          <button class="vote-btn" data-title="${data.title}" data-genre="${data.genre}">+</button>
          <button class="close-btn">x</button>
          <h3>${data.title}</h3>
          <p>IMDb Rating: ${data.rating}</p>
          <p>Genre: ${data.genre}</p>
          <p>Plot: ${data.plot}</p>
        </div>
      `;

      document.querySelector(".close-btn").addEventListener("click", (e) => {
        searchResult.innerHTML = "";
      });

      document.querySelector(".vote-btn").addEventListener("click", (e) => {
        let filmTitle = e.target.dataset.title;
        let film_genre = e.target.dataset.genre;
        let poster = e.target.closest(".film-card").querySelector("img").src;
        voteForFilm(filmTitle, poster, film_genre);
        searchResult.innerHTML = "";
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
        body: JSON.stringify({
          groupCode,
          filmTitle: title,
          poster: poster,
          filmGenre: film_genre,
          userId: localStorage.getItem("userId"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
      }

      fetchVotes();
    } catch (error) {
      console.error("Error recording vote:", error);
    }
  }

  async function fetchVotes() {
    try {
      const response = await fetch(`/votes/${groupCode}`);
      if (!response.ok) throw new Error("Error fetching votes");

      if (mostVotedFilmSection.innerHTML != "") {
        //console.log("most voted not empty");
        return;
      } else {
        //console.log("most voted empty");
        const data = await response.json();
        votedFilmsList.innerHTML = "";

        data.forEach((film) => {
          if (film.num_votes > 0) {
            const li = document.createElement("li");
            li.className = "votedStyling";
            li.innerHTML = `
            <div class="hoverInfo"> 
              <img class="votedImg" src=${film.poster} height="50px"/>
              <div class="hoverInfoClicked"> 
                ${film.film_title || film.book_title} - 
                <span>${film.film_genre || "N/A"}</span>
              </div>
              <div class="votesText"> 
                ${film.num_votes} votes
              </div>
            </div>
          `;
            votedFilmsList.appendChild(li);
          }
        });
      }
      const data = await response.json();
      votedFilmsList.innerHTML = "";

      data.forEach((film) => {
        if (film.num_votes > 0) {
          const li = document.createElement("li");
          li.innerHTML = `${film.film_title || film.book_title} - ${
            film.num_votes
          } votes - <span style="color: blue;">${
            film.film_genre || "N/A"
          }</span>`;
          votedFilmsList.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  }

  async function checkIfLeader() {
    const response = await fetch(`/checkIfLeader`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        group: groupCode,
      }),
    });
    let data = await response.json();
    console.log(data.message);
    if (data.isLeader && response.ok) {
      document.getElementById("buttonContainer").style.display = "flex";
    } else {
      document.getElementById("startVote").style.display = "none";
      document.getElementById("stopVote").style.display = "none";
    }
  }

  stopVoteButton.addEventListener("click", async () => {
    try {
      await fetch(`/stopVoting/${groupCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      await displayMostVotedFilm();
      searchSection.style.display = "none";
      votedFilmsList.innerHTML = "";
    } catch (error) {
      console.error("Error stopping voting:", error);
    }
  });

  startVoteButton.addEventListener("click", async () => {
    try {
      //console.log("starting vote");
      mostVotedFilmSection.innerHTML = "";
      await fetch(`/clearVotes/${groupCode}`, { method: "DELETE" });
      await fetch(`/startVoting/${groupCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      searchSection.style.display = "flex";
      searchSection.style.display = "block";
      mostVotedFilmSection.innerHTML = "";

      fetchVotes();
    } catch (error) {
      console.error("Error starting voting:", error);
    }
  });


  async function populateHeaderWithGroupInfo() {
    let header = document.getElementById("pageHeader");
    let attributeDisplay = document.createElement("h4");
    let data = JSON.parse(localStorage.getItem("groupInfo"));
    //console.log(data);
    if (data.privacy === "public") {
      attributeDisplay.textContent = `Privacy: Public - Code: ${data.secret_code}`;
    } else if (
      data.privacy === "private" &&
      data.leader_id === parseInt(localStorage.getItem("userId"))
    ) {
      attributeDisplay.textContent = `Privacy: Private - Code: ${data.secret_code}`;
    } else if (data.privacy === "private") {
      attributeDisplay.textContent = `Privacy: Private`;
    }
    header.appendChild(attributeDisplay);
  }

  // populates groupInfo into local storage upon page load
  async function populateGroupInfo() {
    const response = await fetch(`/getGroupInfo?name=${groupCode}`);
    let data = await response.json();
    localStorage.setItem("groupInfo", JSON.stringify(data));
  }

  async function deleteGroup(groupId) {
    try {
      const response = await fetch(`/deleteGroup?id=${groupId}`);

      if (response.ok) {
        const body = await response.json();
        alert(body.message);
        window.location.href = '/selection.html';
      } else {
        const errorBody = await response.json();
        alert(errorBody.message);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async function setLeaderUsername() {
    try {
      let leaderId = JSON.parse(localStorage.getItem("groupInfo")).leader_id;
      const response = await fetch(`/getUsername/${leaderId}`);
      if (response.ok) {
        const body = await response.json();
        localStorage.setItem("leaderUsername", body.rows[0].username);
      }
      else {
        console.error("Could not retrieve leader username");
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  async function removeMemberFromGroup(userId, groupId) {
    console.log("In remove member form group = userid:" , userId, "and groupdId:", groupId);
    try {
      const response = await fetch(`/removeMemberFromGroup`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({userId: userId, groupId: groupId})
      });
      const body = await response.json();
      if (body.isSuccess) {
        alert("You have been successfully removed from group: " + groupCode);
        window.location.href= '/selection.html';
      }
      else {
        alert("There was an error in removing you from the group. Try again.");
        console.error(body.message);
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  function validateNewLeader(leader, usernames) {
    leader = leader.trim();
    while (!usernames.includes(leader)) {
      leader = prompt("Please enter a valid username to reassign to:\n" + usernames.join(", "));
    }
    return leader;
  }

  async function updateLeaderForGroup(groupId, newLeaderUsername) {
    try {
      const response = await fetch("/updateLeader", {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: newLeaderUsername, groupId: groupId})
      });
      const body = await response.json();
      if (body.isSuccess) {
        alert("Leader has been successfully updated");
      }
      else {
        alert(body.message);
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  function buildQueryString(members) {
    return `members=${members.join('&members=')}`;
  }

  async function fetchMembers(queryString) {
    const response = await fetch(`/getMembersFromIDs?${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }
    return response.json();
  }

  function getReassignPrompt(usernames) {
    const memberString = `
      The following list is the remaining members. 
      Please enter a username to reassign to:
      ${usernames.join(", ")}
    `.trim();
    return prompt(memberString);
  }

  async function reassignLeaderAndLeave(groupId, members, storedUserId) {
    try {
      const queryString = buildQueryString(members);
      const body = await fetchMembers(queryString);

      const noLeaderUsernames = body.usernames.filter(username => username !== localStorage.getItem("leaderUsername"));
      let newLeader = getReassignPrompt(noLeaderUsernames);
      newLeader = validateNewLeader(newLeader, noLeaderUsernames);

      await updateLeaderForGroup(groupId, newLeader);
      await removeMemberFromGroup(storedUserId, groupId);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async function handleGroupExit(storedUserId, leaderId, groupId, members) {
    try {
      if (storedUserId === leaderId && members.length === 1) {
        // Sole member scenario
        if (confirm("You are the sole member of the group. If you leave, the group and all its data will be deleted. Proceed?")) {
          try {
            await deleteGroup(groupId);
            console.log("Group deleted successfully.");
          } catch (error) {
            console.error("Failed to delete the group:", error);
          }
        }
      } 
      // Leader reassignment scenario
      else if (storedUserId === leaderId) {
        if (confirm("You are the leader of the group. Would you like to re-assign leadership and proceed with leaving the group?")) {
          try {
            await reassignLeaderAndLeave(groupId, members, storedUserId);
            console.log("Leader reassigned and left the group successfully.");
          } catch (error) {
            console.error("Failed to reassign leader or leave the group:", error);
          }
        }
      } 
      // Normal member leave scenario
      else {
        if (confirm("You are about to permanently exit the group. Proceed?")) {
          try {
            await removeMemberFromGroup(storedUserId, groupId);
            console.log("Member removed from the group successfully.");
          } catch (error) {
            console.error("Failed to remove member from the group:", error);
          }
        }
      }
    } catch (generalError) {
      console.error("An unexpected error occurred:", generalError);
    }
  }


  leaveGroupButton.addEventListener("click", async () => {
    // Check the which case should leave group execute under:
    let storedUserId = parseInt(localStorage.getItem("userId"));
    let groupBody = JSON.parse(localStorage.getItem("groupInfo"));
    console.log(groupBody)
    if (groupBody === null || groupBody === undefined) {
      return;
    }
    let leaderId = groupBody.leader_id;
    let groupId = groupBody.id;
    let members = groupBody.members;
    await handleGroupExit(storedUserId, leaderId, groupId, members);
  });

  populateGroupInfo().then(() => {
    populateHeaderWithGroupInfo();
    setLeaderUsername();
  }).catch((error) => {
    console.error(error);
    window.location.reload();
  });
  fetchVotes();
  checkIfLeader();

  const membersButton = document.getElementById("membersButton");
  const membersList = document.getElementById("membersList");

  membersButton.addEventListener("click", function () {
    // Check if the membersList already has any children (members displayed)
    if (membersList.children.length > 0) {
      // If members are displayed, hide and clear the list
      membersList.innerHTML = "";
    } else {
      // No members displayed, fetch and show them
      fetch(`/getGroupMembers?groupName=${encodeURIComponent(groupCode)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch members");
          }
          return response.json();
        })
        .then((data) => {
          membersList.innerHTML = ""; // Clear previous members
          data.members.forEach((member) => {
            const li = document.createElement("li");
            li.textContent = member.username; // Display username
            if (member.is_leader) {
              li.textContent += " (Leader)"; // Append '(Leader)' to the leader's username
              li.style.fontWeight = "bold"; // style to highlight the leader
            }
            membersList.appendChild(li);
          });
        })
        .catch((error) => {
          console.error("Error fetching group members:", error);
          alert("Error fetching group members. Please try again.");
        });
    }
  });
});

let groupCode = decodeURIComponent(window.location.pathname).split("/").pop();
let username = null;
let socket = io();
socket.on("connect", () => {
  console.log("Socket has been connected.");
});
let send = document.getElementById("sendButton");
let input = document.getElementById("messageInput");
let messages = document.getElementById("messages");
send.addEventListener("click", () => {
  let message = input.value;
  if (message === "") {
    return;
  }

  // Add to successful return body for add message fetch
  // appendSentMessage(message, username);

  console.log("Sending message:", message);
  fetch("/addMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sentUser: username,
      message: message,
      groupName: groupCode,
    }),
  })
    .then((response) => {
      console.log(response);
      return response
        .json()
        .then((body) => {
          console.log(
            "Successful message addition. Now appending and sending to room:"
          );
          appendSentMessage(message, username);
          socket.emit("sendMessageToRoom", { message, username });
          input.value = "";
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });

  // Add this to successful return body for add message fetch
  // socket.emit('sendMessageToRoom', { message });
});

// Sets username based on token storage in server
fetch("/getUsernameForGroup")
  .then((response) => {
    return response.json();
  })
  .then((body) => {
    username = body["username"];
  })
  .catch((error) => {
    console.error(error);
  });

fetch(`/getMessages?groupName=${groupCode}`)
  .then((response) => {
    return response.json();
  })
  .then((body) => {
    console.log(body);
    displayExistingMessages(body);
  })
  .catch((error) => {
    console.error(error);
  });

// Ideally you receive a username of who sent it, send a token, return the username
socket.on("receive", (data, userWhoSent) => {
  console.log("Received message:", data, "from:", userWhoSent);
  appendReceivedMessage(data, userWhoSent);
});

function appendReceivedMessage(msg, defaultUser = "") {
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

function appendSentMessage(msg, defaultUser = "") {
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
    } else {
      appendReceivedMessage(row["user_message"], row["username"]);
    }
  }
}
