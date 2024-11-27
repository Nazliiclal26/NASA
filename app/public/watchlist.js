let accountButton = document.getElementById("account");
let logoutButton = document.getElementById("logout");

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Not logged in.");
    window.location.href = "/login.html"; // Redirect to login if not logged in
    return;
  }
  fetch(`/getWatchlist/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const filmList = document.getElementById("filmWatchlist");
        const bookList = document.getElementById("bookWatchlist");

        let currentRowFilms;
        let currentRowBooks;

        // Handle films
        data.items
          .filter((item) => item.item_type === "movies")
          .forEach((film, index) => {
            if (index % 5 === 0) {
              currentRowFilms = document.createElement("div");
              currentRowFilms.className = "row";
              filmList.appendChild(currentRowFilms);
            }
            const li = document.createElement("div");
            li.className = "watchlist-item";

            // Image and title container
            const contentDiv = document.createElement("div");
            contentDiv.className = "content";

            const img = document.createElement("img");
            img.src = film.poster;
            img.alt = film.item_id + " poster";
            img.style = "width: 100px; height: auto; margin-right: 10px;";

            const title = document.createElement("div");
            title.textContent = film.item_id;
            title.style.marginTop = "10px";

            // Remove button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.onclick = () => removeItem(film.item_id, userId, li);

            contentDiv.appendChild(img);
            contentDiv.appendChild(title);
            li.appendChild(contentDiv);
            li.appendChild(removeBtn);

            currentRowFilms.appendChild(li);
          });

        // Handle books similarly
        data.items
          .filter((item) => item.item_type === "books")
          .forEach((book, index) => {
            if (index % 5 === 0) {
              currentRowBooks = document.createElement("div");
              currentRowBooks.className = "row";
              bookList.appendChild(currentRowBooks);
            }
            const li = document.createElement("div");
            li.className = "watchlist-item";

            const contentDiv = document.createElement("div");
            contentDiv.className = "content";

            const img = document.createElement("img");
            img.src = book.poster;
            img.alt = book.item_id + " poster";
            img.style = "width: 100px; height: auto; margin-right: 10px;";

            const title = document.createElement("div");
            title.textContent = book.item_id;
            title.style.marginTop = "10px";

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.onclick = () => removeItem(book.item_id, userId, li);

            contentDiv.appendChild(img);
            contentDiv.appendChild(title);
            li.appendChild(contentDiv);
            li.appendChild(removeBtn);

            currentRowBooks.appendChild(li);
          });
      } else {
        alert("Failed to load watchlist.");
      }
    })
    .catch((error) => {
      console.error("Error fetching watchlist:", error);
    });
});

function removeItem(title, userId, element) {
  fetch(`/removeFromWatchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title, userId: userId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert("Item removed successfully");
        element.remove();
        location.reload();
      } else {
        alert("Failed to remove item");
      }
    })
    .catch((error) => console.error("Error removing item:", error));
}

accountButton.addEventListener("click", () => {
  window.location.href = "/account.html";
});

logoutButton.addEventListener("click", () => {
  localStorage.clear("userId");
  // make fetch request to clear the cookie as well fetch('/clearCookie')
  fetch("/clearCookie")
    .then((response) => {
      return response.json();
    })
    .then((body) => {
      window.location.href = "/";
      console.log(body.message);
    })
    .catch((error) => {
      console.error(error);
    });
});
