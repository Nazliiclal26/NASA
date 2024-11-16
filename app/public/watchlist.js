document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Not logged in.");
      window.location.href = "/login.html"; // Redirect to login if not logged in
      return;
    }
  
    fetch(`/getWatchlist/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          const films = data.items.filter(item => item.item_type === "movies");
          const books = data.items.filter(item => item.item_type === "books");
  
          const filmList = document.getElementById("filmWatchlist");
          const bookList = document.getElementById("bookWatchlist");
  
          films.forEach(film => {
            const li = document.createElement("li");
            li.style = "margin-bottom: 20px;"; // Adds space below each item

            const div = document.createElement("div");
            const img = document.createElement("img");
            const title = document.createElement("div");

            img.src = film.poster; // Assuming 'poster' is the name of the column that holds the image URL
            img.alt = film.item_id + " poster";
            img.style = "width: 100px; height: auto;"; // You can adjust style as needed

            title.textContent = film.item_id; // The title of the book

            div.appendChild(img);
            div.appendChild(title);
            li.appendChild(div);
            filmList.appendChild(li);
          });
  
          books.forEach(book => {
            const li = document.createElement("li");
            li.style = "margin-bottom: 20px;"; // Adds space below each item

            const div = document.createElement("div");
            const img = document.createElement("img");
            const title = document.createElement("div");
            
            img.src = book.poster; // Assuming 'poster' is the name of the column that holds the image URL
            img.alt = book.item_id + " poster";
            img.style = "width: 100px; height: auto;"; // You can adjust style as needed

            title.textContent = book.item_id; // The title of the book

            div.appendChild(img);
            div.appendChild(title);
            li.appendChild(div);
            bookList.appendChild(li);
          });
        } else {
          alert("Failed to load watchlist.");
        }
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });
  });
  