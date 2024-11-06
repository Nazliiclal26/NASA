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
        const response = await fetch("/vote", {
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