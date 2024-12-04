booksButton.addEventListener("click", () => {
  localStorage.setItem("type", "books");
  searchType.innerHTML = `
    <option value="title">Title</option>
    <option value="author">Author</option>
    <option value="isbn">ISBN</option>
  `;
});

moviesButton.addEventListener("click", () => {
  localStorage.setItem("type", "movies");
  searchType.innerHTML = `
    <option value="title">Title</option>
    <option value="imdbId">IMDb ID</option>
  `;
});

searchButton.addEventListener("click", async () => {
  let type = localStorage.getItem("type");
  let searchValue = document.getElementById("search").value;
  let selectedSearchType = searchType.value;

  if (!searchValue) {
    searchResult.innerText = "Please enter a search term.";
    return;
  }

  try {
    let url;
    if (type === "movies") {
      if (selectedSearchType === "title") {
        url = `/groupSearchMax?title=${encodeURIComponent(searchValue)}`;
      } else {
        // IMDb ID
        url = `/movieSearchById?imdbId=${encodeURIComponent(searchValue)}`;
      }
    } else {
      // books
      if (selectedSearchType === "title") {
        url = `/groupSearchBook?title=${encodeURIComponent(searchValue)}`;
      } else if (selectedSearchType === "author") {
        url = `/bookSearchByAuthor?author=${encodeURIComponent(searchValue)}`;
      } else {
        // ISBN
        url = `/bookSearchByISBN?isbn=${encodeURIComponent(searchValue)}`;
      }
    }

    let response = await fetch(url);
    if (!response.ok) {
      searchResult.innerText = "Film not found or an error occurred.";
      console.error("Response not OK:", response.statusText);
      return;
    }

    let data = await response.json();
    let movieObjs = data.Search;

    if (!data || Object.keys(data).length === 0) {
      searchResult.innerText = "No data received for the film.";
      return;
    }

    searchResult.innerHTML = ""; // Clear previous results

    if (type === "movies") {
      // Display movie information

      let newSection = document.createElement("ul");
      newSection.classList.add("verticalSearch");

      for (let each of movieObjs) {
        console.log(each.Title);
        try {
          let newResponse = await fetch(
            `/groupSearch?title=${encodeURIComponent(each.Title)}`
          );

          let newData = await newResponse.json();

          console.log(newData);

          let newSectionContent = document.createElement("li");
          newSectionContent.innerHTML = `
        <div class="film-card">
        <div class="top">
          <div class="leftContent">
            <img class="searchImage" src="${newData.poster}" alt="${newData.title} poster">
          </div>
          <div class="rightContent"> 
            <h3 class="searchTitle">${newData.title}</h3>
            <p>IMDb Rating: ${newData.rating}</p>
            <p>Genre: ${newData.genre}</p>
            <button class="watchlist-btn watchlistButton2" data-title="${newData.title}" data-genre="${newData.genre}" data-poster="${newData.poster}">+</button>
          </div>
        </div>
        <div id="bottom">
          <p>Plot: ${newData.plot}</p>
        </div> 
        </div>
      `;

          newSection.appendChild(newSectionContent);
        } catch (error) {
          newSection.appendChild(error);
        }
      }

      console.log(newSection);
      searchResult.appendChild(newSection);
    } else {
      // books
      // Display book information
      searchResult.innerHTML = `
        <div class="book-card">
        <div class="top">
          <div class="leftContent">
            <img class="searchImage" src="${data.poster}" alt="${data.title} poster">
          </div>
          <div class="rightContent"> 
            <h3 class="searchTitle">${data.title}</h3>
            <p class="searchAuthors">Author(s): ${data.authors}</p>
            <p class="searchPublished">Date Published: ${data.publishedDate}</p>
            <button class="watchlist-btn watchlistButton2" data-title="${data.title}" data-authors="${data.authors}" data-poster="${data.poster}">+</button>
          </div>
        </div>
        <div id="bottom">
          <p>Description: ${data.description}</p>
        </div> 
        </div>
      `;
    }

    // Attach event listeners to new watchlist buttons
    document.querySelectorAll(".watchlist-btn").forEach((button) => {
      button.addEventListener("click", () => {
        let userId = localStorage.getItem("userId");
        if (!userId) {
          alert("You need to be logged in to add to the watchlist.");
          return;
        }

        let productInfo = {
          type: type, // this will use either "movies" or "books" based on the selection
          title: button.getAttribute("data-title"),
          poster: button.getAttribute("data-poster"), // Pass poster URL to the server
          userId: userId,
        };

        fetch(`/addToWatchlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productInfo),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              alert("Added to watchlist!");
            } else {
              alert("Failed to add to watchlist: " + data.message);
            }
          })
          .catch((error) => {
            console.error("Error adding to watchlist:", error);
            alert("Error adding to watchlist.");
          });
      });
    });
  } catch (error) {
    searchResult.innerText = `${
      type === "movies" ? "Film" : "Book"
    } not found or an error occurred.`;
    console.error("Error fetching data:", error);
  }
});
