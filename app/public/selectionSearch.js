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
    searchResult.innerHTML = "Loading";
    let url;

    if (type === "movies") {
      // Movies
      if (selectedSearchType === "title") {
        url = `/groupSearchMax?title=${encodeURIComponent(searchValue)}`;
      } else if (selectedSearchType === "genre") {
        url = `/findMoviesByGenre?genre=${encodeURIComponent(searchValue)}`;

        // if (!genreResponse.ok) throw new Error("Genre not found");
        // let genreData = await genreResponse.json();

        // ///

        // let newSection = document.createElement("ul");
        // newSection.classList.add("verticalSearch");

        // for (let each of genreData.titles) {
        //   //console.log(each.Title);
        //   try {
        //     let newResponse = await fetch(
        //       `/groupSearch?title=${encodeURIComponent(each)}`
        //     );

        //     let newData = await newResponse.json();

        //     //console.log(newData);

        //     let newSectionContent = document.createElement("li");
        //     newSectionContent.innerHTML = `
        //   <div class="film-card">
        //   <div class="top">
        //     <div class="leftContent">
        //       <img class="searchImage" src="${newData.poster}" alt="${newData.title} poster">
        //     </div>
        //     <div class="rightContent">
        //       <h3 class="searchTitle">${newData.title}</h3>
        //       <p>IMDb Rating: ${newData.rating}</p>
        //       <p>Genre: ${newData.genre}</p>
        //       <button class="watchlist-btn watchlistButton2" data-title="${newData.title}" data-genre="${newData.genre}" data-poster="${newData.poster}">+</button>
        //     </div>
        //   </div>
        //   <div id="bottom">
        //     <p>Plot: ${newData.plot}</p>
        //   </div>
        //   </div>
        // `;

        //     newSection.appendChild(newSectionContent);
        //   } catch (error) {
        //     newSection.appendChild(error);
        //   }
        // }

        // //console.log(newSection);
        // searchResult.appendChild(newSection);
        // attachWatchlistListeners();
        // return;
      } else {
        url = `/movieSearchById?imdbId=${encodeURIComponent(searchValue)}`;
      }
    } else {
      // Books
      if (selectedSearchType === "title") {
        url = `/groupSearchBookMax?title=${encodeURIComponent(searchValue)}`;
      } else if (selectedSearchType === "author") {
        url = `/bookSearchByAuthorMax?author=${encodeURIComponent(
          searchValue
        )}`;
      } else if (selectedSearchType === "genre") {
        url = `/bookSearchByGenreMax?genre=${encodeURIComponent(searchValue)}`;
      } else {
        url = `/bookSearchByISBN?isbn=${encodeURIComponent(searchValue)}`;
      }
    }

    let response = await fetch(url);

    if (!response.ok) {
      searchResult.innerText = `${
        type === "movies" ? "Film" : "Book"
      } not found or an error occurred.`;
      console.error("Response not OK:", response.statusText);
      return;
    }

    let data = await response.json();
    console.log(data);

    if (!data || Object.keys(data).length === 0) {
      searchResult.innerText = `No data received for the ${
        type === "movies" ? "film" : "book"
      }.`;
      return;
    }

    if (type === "movies") {
      // Display movie information

      let newSection = document.createElement("ul");
      newSection.classList.add("verticalSearch");

      console.log(data);

      for (let each of data) {
        //console.log(each.Title);
        try {
          let newResponse = await fetch(
            `/groupSearch?title=${encodeURIComponent(each)}`
          );

          let newData = await newResponse.json();

          //console.log(newData);

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

      //console.log(newSection);
      searchResult.innerHTML = "";
      searchResult.appendChild(newSection);
    } else {
      // books
      // Display book information

      let newSection = document.createElement("ul");
      newSection.classList.add("verticalSearch");

      // console.log(data.books);

      for (let each of data) {
        //console.log(each.volumeInfo.title);
        try {
          let newResponse = await fetch(
            `/groupSearchBook?title=${encodeURIComponent(
              each.volumeInfo.title
            )}`
          );

          let newData = await newResponse.json();

          //console.log(newData);

          let newSectionContent = document.createElement("li");
          newSectionContent.innerHTML = `
        <div class="book-card">
        <div class="top">
          <div class="leftContent">
            <img class="searchImage" src="${newData.poster}" alt="${newData.title} poster">
          </div>
          <div class="rightContent"> 
            <h3 class="searchTitle">${newData.title}</h3>
            <p class="searchAuthors">Author(s): ${newData.authors}</p>
            <p class="searchPublished">Date Published: ${newData.publishedDate}</p>
            <button class="watchlist-btn watchlistButton2" data-title="${newData.title}" data-authors="${newData.authors}" data-poster="${newData.poster}">+</button>
          </div>
        </div>
        <div id="bottom">
          <p>Description: ${newData.description}</p>
        </div> 
        </div>
      `;

          newSection.appendChild(newSectionContent);
        } catch (error) {
          newSection.appendChild(error);
        }
      }

      //console.log(newSection);
      searchResult.innerHTML = "";
      searchResult.appendChild(newSection);
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
