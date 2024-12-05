booksButton.addEventListener("click", () => {
  localStorage.setItem("type", "books");
  searchType.innerHTML = `
    <option value="title">Title</option>
    <option value="genre">Genre</option>
    <option value="author">Author</option>
    <option value="isbn">ISBN</option>
  `;
});

moviesButton.addEventListener("click", () => {
  localStorage.setItem("type", "movies");
  searchType.innerHTML = `
    <option value="title">Title</option>
    <option value="genre">Genre</option>
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
    searchResult.innerHTML = "";
    let url;

    if (type === "movies") {
      // Movies
      if (selectedSearchType === "title") {
        url = `/groupSearch?title=${encodeURIComponent(searchValue)}`;
      } else if (selectedSearchType === "genre") {
        let genreResponse = await fetch(`/findMoviesByGenre?genre=${encodeURIComponent(searchValue)}`);
        if (!genreResponse.ok) throw new Error("Genre not found");
        let genreData = await genreResponse.json();

        for (let title of genreData.titles) {
          let titleResponse = await fetch(`/groupSearch?title=${encodeURIComponent(title)}`);
          if (!titleResponse.ok) throw new Error("Film not found");

          let data = await titleResponse.json();

          searchResult.innerHTML += `
            <div class="film-card">
              <div class="top">
                <div class="leftContent">
                  <img class="searchImage" src="${data.poster}" alt="${data.title} poster">
                </div>
                <div class="rightContent"> 
                  <h3 class="searchTitle">${data.title}</h3>
                  <p>IMDb Rating: ${data.rating}</p>
                  <p>Genre: ${data.genre}</p>
                  <button class="watchlist-btn watchlistButton2" data-title="${data.title}" data-genre="${data.genre}" data-poster="${data.poster}">+</button>
                </div>
              </div>
              <div id="bottom">
                <p>Plot: ${data.plot}</p>
              </div> 
            </div>
          `;
        }
        attachWatchlistListeners();
        return;
      } else {
        url = `/movieSearchById?imdbId=${encodeURIComponent(searchValue)}`;
      }
    } else {
      // Books 
      if (selectedSearchType === "title") {
        url = `/groupSearchBookMax?title=${encodeURIComponent(searchValue)}`;
      } else if (selectedSearchType === "author") {
        url = `/bookSearchByAuthor?author=${encodeURIComponent(searchValue)}`;
      } else if (selectedSearchType === "genre") {
        url = `/bookSearchByGenre?genre=${encodeURIComponent(searchValue)}`;
      } else {
        url = `/bookSearchByISBN?isbn=${encodeURIComponent(searchValue)}`;
      }
    }

    let response = await fetch(url);
    if (!response.ok) {
      searchResult.innerText = `${type === "movies" ? "Film" : "Book"} not found or an error occurred.`;
      console.error("Response not OK:", response.statusText);
      return;
    }

    let data = await response.json();
    // console.log(data);

    if (!data || Object.keys(data).length === 0) {
      searchResult.innerText = `No data received for the ${type === "movies" ? "film" : "book"}.`;
      return;
    }

    if (type === "movies") {
      searchResult.innerHTML += `
        <div class="film-card">
          <div class="top">
            <div class="leftContent">
              <img class="searchImage" src="${data.poster}" alt="${data.title} poster">
            </div>
            <div class="rightContent"> 
              <h3 class="searchTitle">${data.title}</h3>
              <p>IMDb Rating: ${data.rating}</p>
              <p>Genre: ${data.genre}</p>
              <button class="watchlist-btn watchlistButton2" data-title="${data.title}" data-genre="${data.genre}" data-poster="${data.poster}">+</button>
            </div>
          </div>
          <div id="bottom">
            <p>Plot: ${data.plot}</p>
          </div> 

        </div>
      `;

          newSection.appendChild(newSectionContent);
        } catch (error) {
          newSection.appendChild(error);
        }
      }

      //console.log(newSection);
      searchResult.appendChild(newSection);
    } else {
      let books = Array.isArray(data.books) ? data.books : [data]; 
      books.forEach((book) => {
        searchResult.innerHTML += `
          <div class="book-card">
            <div class="top">
              <div class="leftContent">
                <img class="searchImage" src="${book.poster || 'https://via.placeholder.com/150'}" alt="${book.title} poster">
              </div>
              <div class="rightContent"> 
                <h3 class="searchTitle">${book.title}</h3>
                <p class="searchAuthors">Author(s): ${book.authors || "Unknown"}</p>
                <p class="searchPublished">Date Published: ${book.publishedDate || "Unknown"}</p>
                <button class="watchlist-btn watchlistButton2" data-title="${book.title}" data-authors="${book.authors}" data-poster="${book.poster}">+</button>
              </div>
            </div>
            <div id="bottom">
              <p>Description: ${book.description || "No description available."}</p>
            </div> 
          </div>
        `;
      });
    }

    attachWatchlistListeners();
  } catch (error) {
    searchResult.innerText = `${
      type === "movies" ? "Film" : "Book"
    } not found or an error occurred.`;
    console.error("Error fetching data:", error);
  }
});

function attachWatchlistListeners() {
  document.querySelectorAll(".watchlist-btn").forEach((button) => {
    button.addEventListener("click", () => {
      let userId = localStorage.getItem("userId");
      if (!userId) {
        alert("You need to be logged in to add to the watchlist.");
        return;
      }

      let productInfo = {
        type: localStorage.getItem("type"), // "movies" or "books"
        title: button.getAttribute("data-title"),
        poster: button.getAttribute("data-poster"),
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
            alert(`Failed to add to watchlist: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("Error adding to watchlist:", error);
          alert("Error adding to watchlist.");
        });
    });
  });
}

