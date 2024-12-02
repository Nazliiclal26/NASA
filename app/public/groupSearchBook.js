let socket = io();
socket.on("connect", () => {
  console.log("Socket has been connected.");
});

document.addEventListener("DOMContentLoaded", async () => {
  let searchSection = document.getElementById("searchSection");
  let searchButton = document.getElementById("searchBook");
  let searchResult = document.getElementById("searchResult");
  let votedBooksList = document.getElementById("votedBooks");
  let groupCode = decodeURIComponent(window.location.pathname).split("/").pop();
  let stopVoteButton = document.getElementById("stopVote");
  let startVoteButton = document.getElementById("startVote");
  let reassignButton = document.getElementById("reassign");
  let mostVotedBookSection = document.getElementById("mostVotedBook");
  let leaveGroupButton = document.getElementById("leaveGroup");

  let form = document.getElementById("bookSuggestionsForm");
  let resultsContainer = document.getElementById("bookSuggestionsResult");

  

  async function reassignLeader() {
    try {  

      let groupBody = JSON.parse(localStorage.getItem("groupInfo"));
      console.log(groupBody);
      if (groupBody === null || groupBody === undefined) {
        console.log("GroupInfo not populated, cannot reassign leader")
        return;
      }
      let groupId = groupBody.id;
      let members = groupBody.members;

      const queryString = buildQueryString(members);
      const body = await fetchMembers(queryString);

      const noLeaderUsernames = body.usernames.filter(
        (username) => username !== localStorage.getItem("leaderUsername")
      );
      let newLeader = getReassignPrompt(noLeaderUsernames);
      newLeader = validateNewLeader(newLeader, noLeaderUsernames);

      await updateLeaderForGroup(groupId, newLeader);
    }
    catch (err) {
      console.error("An error occurred:", err);
    }
  }

  reassignButton.addEventListener("click", reassignLeader);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resultsContainer.innerHTML = "";

    let preferences = {
      genre: document.getElementById("bookGenre").value,
      mood: document.getElementById("bookMood").value,
      author: document.getElementById("author").value || null,
      bookType: document.getElementById("bookType").value,
      minRating: document.getElementById("minRating").value,
      audience: document.getElementById("audience").value,
      minPages: document.getElementById("minPages").value || null,
      maxPages: document.getElementById("maxPages").value || null,
    };

    try {
      let response = await fetch("/bookGroup/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      let rawData = await response.json();
      let chatGPTAnswer = rawData.choices[0].message.content;

      resultsContainer.innerHTML = `<h2>Recommended Books:</h2><pre>${chatGPTAnswer}</pre>`;
    } catch (error) {
      //console.error("Error fetching recommendations:", error);
      resultsContainer.innerHTML = `<p>Please try again later!</p>`;
    }
  });

  try {
    let votingStatusResponse = await fetch(`/getVotingStatus/${groupCode}`);
    let { votingStatus } = await votingStatusResponse.json();

    if (votingStatus) {
      await displayMostVotedBook();
      searchSection.style.display = "none";
      votedBooksTitle.innerHTML = "";
    } else {
      searchSection.style.display = "flex";
    }
  } catch (error) {
    console.error("Error initializing page:", error);
  }

  async function displayMostVotedBook() {
    try {
      let response = await fetch(`/bookVotes/${groupCode}`);
      if (response.ok) {
        let data = await response.json();
        if (data.length > 0) {
          let mostVoted = data.reduce((a, b) => {
            if (a.num_votes === b.num_votes) {
              return Math.random() < 0.5 ? a : b;
            } else {
              return a.num_votes > b.num_votes ? a : b;
            }
          });

          let setMostVotedResponse = await fetch(`/votes/setMostVotedBook/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupCode,
              book_title: mostVoted.book_title,
            }),
          });

          if (setMostVotedResponse.ok) {
            let updatedBook = await setMostVotedResponse.json();

            votedBooksList.innerHTML = "";

            mostVotedBookSection.innerHTML = `
              <div class="winnerOuter">
                <div class="winnerContext">
                  <h2>Most Voted Book</h2>
                  <p>${updatedBook.book_title} with ${updatedBook.num_votes} votes!</p>
                </div>
                <img id="winnerPoster" src="${updatedBook.poster}" alt="${updatedBook.book_title} poster" style="max-width: 200px;">
              </div>
            `;
          } else {
            console.error("Failed to set the most voted book.");
            mostVotedBookSection.innerHTML =
              "<p>Error setting the most voted book. Please try again later.</p>";
          }
        } else {
          mostVotedBookSection.innerHTML = "<p>No votes yet.</p>";
        }
      } else {
        console.error("Failed to fetch votes.");
        mostVotedBookSection.innerHTML =
          "<p>Error fetching votes. Please try again later.</p>";
      }
    } catch (error) {
      console.error("Error fetching or updating the most voted book:", error);
      mostVotedBookSection.innerHTML =
        "<p>Something went wrong. Please try again later.</p>";
    }
  }

  async function voteForBook(title, poster) {
    try {
      let response = await fetch("/bookVote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupCode: groupCode,
          bookTitle: title,
          poster,
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
      const response = await fetch(`/bookVotes/${groupCode}`);
      if (!response.ok) throw new Error("Error fetching book votes");

      if (mostVotedBookSection.innerHTML != "") {
        //console.log("most voted not empty");
        return;
      } else {
        const data = await response.json();
        votedBooksList.innerHTML = "";

        data.forEach((book) => {
          if (book.num_votes > 0) {
            const li = document.createElement("li");
            li.className = "votedStyling";
            li.innerHTML = `
            <div class="hoverInfo"> 
              <img class="votedImg" src=${book.poster} height="50px"/>
              <div class="hoverInfoClicked"> 
                ${book.book_title}
              </div>
              <div class="votesText"> 
                ${book.num_votes} votes
              </div>
            </div>
          `;
            votedBooksList.appendChild(li);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching book votes:", error);
    }
  }

  stopVoteButton.addEventListener("click", async () => {
    try {
      await fetch(`/stopVoting/${groupCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      await displayMostVotedBook();
      searchSection.style.display = "none";
      votedBooksList.innerHTML = "";
      votedBooksTitle.innerHTML = "";
    } catch (error) {
      console.error("Error stopping voting:", error);
    }
  });

  startVoteButton.addEventListener("click", async () => {
    try {
      mostVotedBookSection.innerHTML = "";
      await fetch(`/clearVotes/${groupCode}`, { method: "DELETE" });
      await fetch(`/startVoting/${groupCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      searchSection.style.display = "flex";
      mostVotedBookSection.innerHTML = "";
      votedBooksTitle.innerHTML = "Voted Books";
      fetchVotes();
    } catch (error) {
      console.error("Error starting voting:", error);
    }
  });

  searchButton.addEventListener("click", async () => {
    let title = document.getElementById("searchTitle").value;

    if (!title) {
      searchResult.innerText = "Please enter a book title.";
      return;
    }

    try {
      const response = await fetch(
        `/groupSearchBook?title=${encodeURIComponent(title)}`
      );
      if (!response.ok) throw new Error("Book not found");

      const data = await response.json();
      searchResult.innerHTML = `
        <div class="book-card">
          <img src="${data.poster}" alt="${data.title} poster">
          <button class="vote-btn" data-title="${data.title}">+</button>
          <button class="close-btn">x</button>
          <h3>${data.title}</h3>
          <p>Author(s): ${data.authors}</p>
          <p>Date Published: ${data.publishedDate}</p>
          <p>Rating: ${data.rating}/5</p>
          <p>Description: ${data.description}</p>
        </div>
      `;

      document.querySelector(".close-btn").addEventListener("click", (e) => {
        searchResult.innerHTML = "";
      });

      document.querySelector(".vote-btn").addEventListener("click", (e) => {
        let bookTitle = e.target.dataset.title;
        let poster = e.target.closest(".book-card").querySelector("img").src;
        voteForBook(bookTitle, poster);
        searchResult.innerHTML = "";
      });
    } catch (error) {
      searchResult.innerText = "Book not found or an error occurred.";
      console.error("Error fetching book:", error);
    }
  });

  fetchVotes();

  async function fetchGroupWatchlist() {
    try {
      let response = await fetch(`/getGroupWatchlistBooks/${groupCode}`);
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

  stopVoteButton.addEventListener("click", async () => {
    let response = await fetch(`/votes/${groupCode}`);
    let data = await response.json();

    if (data.length === 0) {
      mostVotedBookSection.innerHTML = "<p>No votes yet.</p>";
      return;
    }

    let mostVoted = data.reduce((a, b) => (a.num_votes > b.num_votes ? a : b));
    mostVotedBookSection.innerHTML = `
        <h2>Most Voted Book</h2>
        <p>${mostVoted.book_title} with ${mostVoted.num_votes} votes!</p>
        <img src="${mostVoted.poster}" style="max-width: 200px;">
      `;
    searchSection.style.display = "none";
  });

  startVoteButton.addEventListener("click", async () => {
    await fetch(`/clearVotes/${groupCode}`, { method: "DELETE" });
    searchSection.style.display = "flex";
    mostVotedBookSection.innerHTML = "";
    fetchVotes();
  });

  // execute fetch request for deleting group , sending in group id
  async function deleteGroup(groupId) {
    try {
      const response = await fetch(`/deleteGroup?id=${groupId}`);

      if (response.ok) {
        const body = await response.json();
        alert(body.message);
        window.location.href = "/selection.html";
      } else {
        const errorBody = await response.json();
        alert(errorBody.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  async function setLeaderUsername() {
    try {
      let leaderId = JSON.parse(localStorage.getItem("groupInfo")).leader_id;
      const response = await fetch(`/getUsername/${leaderId}`);
      if (response.ok) {
        const body = await response.json();
        localStorage.setItem("leaderUsername", body.rows[0].username);
      } else {
        console.error("Could not retrieve leader username");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function removeMemberFromGroup(userId, groupId) {
    console.log(
      "In remove member form group = userid:",
      userId,
      "and groupdId:",
      groupId
    );
    try {
      const response = await fetch(`/removeMemberFromGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, groupId: groupId }),
      });
      const body = await response.json();
      if (body.isSuccess) {
        alert("You have been successfully removed from group: " + groupCode);
        window.location.href = "/selection.html";
      } else {
        alert("There was an error in removing you from the group. Try again.");
        console.error(body.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function validateNewLeader(leader, usernames) {
    leader = leader.trim();
    while (!usernames.includes(leader)) {
      leader = prompt(
        "Please enter a valid username to reassign to:\n" + usernames.join(", ")
      );
    }
    return leader;
  }

  async function updateLeaderForGroup(groupId, newLeaderUsername) {
    try {
      const response = await fetch("/updateLeader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newLeaderUsername, groupId: groupId }),
      });
      const body = await response.json();
      if (body.isSuccess) {
        alert("Leader has been successfully updated");
        window.location.html;
      } else {
        alert(body.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function buildQueryString(members) {
    return `members=${members.join("&members=")}`;
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

      const noLeaderUsernames = body.usernames.filter(
        (username) => username !== localStorage.getItem("leaderUsername")
      );
      let newLeader = getReassignPrompt(noLeaderUsernames);
      newLeader = validateNewLeader(newLeader, noLeaderUsernames);

      await updateLeaderForGroup(groupId, newLeader);

      await removeMemberFromGroup(storedUserId, groupId);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  async function handleGroupExit(storedUserId, leaderId, groupId, members) {
    try {
      if (storedUserId === leaderId && members.length === 1) {
        // Sole member scenario
        if (
          confirm(
            "You are the sole member of the group. If you leave, the group and all its data will be deleted. Proceed?"
          )
        ) {
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
        if (
          confirm(
            "You are the leader of the group. Would you like to re-assign leadership and proceed with leaving the group?"
          )
        ) {
          try {
            await reassignLeaderAndLeave(groupId, members, storedUserId);
            console.log("Leader reassigned and left the group successfully.");
          } catch (error) {
            console.error(
              "Failed to reassign leader or leave the group:",
              error
            );
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
    console.log(groupBody);
    if (groupBody === null || groupBody === undefined) {
      return;
    }
    let leaderId = groupBody.leader_id;
    let groupId = groupBody.id;
    let members = groupBody.members;
    await handleGroupExit(storedUserId, leaderId, groupId, members);
  });

  populateGroupInfo()
    .then(() => {
      populateHeaderWithGroupInfo();
      setLeaderUsername();
    })
    .catch((error) => {
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
              li.style.fontWeight = "bold"; // Optionally style to highlight the leader
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
