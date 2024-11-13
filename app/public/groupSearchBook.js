document.addEventListener("DOMContentLoaded", async () => {
    let searchSection = document.getElementById("searchSection");
    let searchButton = document.getElementById("searchBook");
    let searchResult = document.getElementById("searchResult");
    let votedBooksList = document.getElementById("votedBooks");
    let groupCode = window.location.pathname.split("/").pop(); 
    let stopVoteButton = document.getElementById("stopVote");
    let startVoteButton = document.getElementById("startVote");
    let mostVotedBookSection = document.getElementById("mostVotedBook");
    
    try {
      let response = await fetch(`/getMostVoted/${groupCode}`);
      if (response.ok) {
        let mostVoted = await response.json();
        if (mostVoted) {
          mostVotedBookSection.innerHTML = `
            <h2>Most Voted Book</h2>
            <p>${mostVoted.book_title} with ${mostVoted.num_votes} votes!</p>
            <img src="${mostVoted.poster}" alt="${mostVoted.book_title} poster" style="max-width: 200px;">
          `;
          searchSection.style.display = "none"; 
        }
      } else {
        console.log("No most voted book");
      }
    } catch (error) {
      console.error("Error fetching the most voted book:", error);
    }
  
    searchButton.addEventListener("click", async () => {
      const title = document.getElementById("searchTitle").value;
  
      if (!title) {
        searchResult.innerText = "Please enter a book title.";
        return;
      }
  
      try {
        const response = await fetch(`/groupSearchBook?title=${encodeURIComponent(title)}`);
        if (!response.ok) throw new Error("Book not found");
  
        const data = await response.json();
        searchResult.innerHTML = `
          <div class="book-card">
            <img src="${data.poster}" alt="${data.title} poster">
            <button class="vote-btn" data-title="${data.title}">+</button>
            <h3>${data.title}</h3>
            <p>Author(s): ${data.authors}</p>
            <p>Date Published: ${data.publishedDate}</p>
            <p>Rating: ${data.rating}/5<p>
            <p>Description: ${data.description}</p>
          </div>
        `;
  
        document.querySelector(".vote-btn").addEventListener("click", (e) => {
          let bookTitle = e.target.dataset.title;
          let poster = e.target.closest('.book-card').querySelector('img').src; 
          voteForBook(bookTitle, poster);
        });
      } catch (error) {
        searchResult.innerText = "Book not found or an error occurred.";
        console.error("Error fetching book:", error);
      }
    });
  
    async function voteForBook(title, poster) {
      try {
        const response = await fetch("/bookVote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupCode, bookTitle: title, poster: poster }) 
        });
    
        if (!response.ok) throw new Error("Error voting");
    
        fetchVotes(); 
      } catch (error) {
        console.error("Error recording vote:", error);
      }
    }
  
    async function fetchVotes() {
      try {
        const response = await fetch(`/bookVotes/${groupCode}`);
        if (!response.ok) throw new Error("Error fetching votes");
  
        const data = await response.json();
        votedBooksList.innerHTML = ""; 
  
        data.forEach((book) => {
          if (book.num_votes > 0) {
            const li = document.createElement("li");
            li.textContent = `${book.book_title} - ${book.num_votes} votes`;
            votedBooksList.appendChild(li);
          }
        });
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
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
      searchSection.style.display = "block"; 
      mostVotedBookSection.innerHTML = ""; 
      fetchVotes(); 
    });
  
    fetchVotes(); 
  });

  let groupCode = window.location.pathname.split("/").pop(); 
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