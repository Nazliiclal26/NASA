document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Not logged in.");
      window.location.href = "/login.html"; // Redirect to login if not logged in
      return;
    }
  
    /*fetch(`/getWatchlist/${userId}`)
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

            img.src = film.poster; 
            img.alt = film.item_id + " poster";
            img.style = "width: 100px; height: auto;"; 

            title.textContent = film.item_id; // The title of the book

            const removeBtn = document.createElement("button");
            removeBtn.textContent = '-';
            removeBtn.dataset.title = film.item_id; // Store the title in the button
            removeBtn.onclick = () => removeItem(removeBtn.dataset.title, userId, li);

            div.appendChild(img);
            div.appendChild(title);
            li.appendChild(removeBtn);
            li.appendChild(div);
            filmList.appendChild(li);
          });
  
          books.forEach(book => {
            const li = document.createElement("li");
            li.style = "margin-bottom: 20px;"; // Adds space below each item

            const div = document.createElement("div");
            const img = document.createElement("img");
            const title = document.createElement("div");
            
            img.src = book.poster; 
            img.alt = book.item_id + " poster";
            img.style = "width: 100px; height: auto;"; 

            title.textContent = book.item_id; // The title of the book

            const removeBtn = document.createElement("button");
            removeBtn.textContent = '-';
            removeBtn.dataset.title = book.item_id; // Store the title in the button
            removeBtn.onclick = () => removeItem(removeBtn.dataset.title, userId, li);

            div.appendChild(img);
            div.appendChild(title);
            li.appendChild(removeBtn);
            li.appendChild(div);
            bookList.appendChild(li);
          });
        } else {
          alert("Failed to load watchlist.");
        }
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });*/
      fetch(`/getWatchlist/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          const filmList = document.getElementById("filmWatchlist");
          const bookList = document.getElementById("bookWatchlist");
  
          // Handle films
          data.items.filter(item => item.item_type === "movies").forEach(film => {
            const li = document.createElement("li");
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
  
            // Remove button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = 'Remove From Watchlist';
            removeBtn.onclick = () => removeItem(film.item_id, userId, li);
  
            contentDiv.appendChild(img);
            contentDiv.appendChild(title);
            li.appendChild(contentDiv);
            li.appendChild(removeBtn);
            filmList.appendChild(li);
          });
  
          // Handle books similarly
          data.items.filter(item => item.item_type === "books").forEach(book => {
            const li = document.createElement("li");
            li.className = "watchlist-item";
  
            const contentDiv = document.createElement("div");
            contentDiv.className = "content";
  
            const img = document.createElement("img");
            img.src = book.poster;
            img.alt = book.item_id + " poster";
            img.style = "width: 100px; height: auto; margin-right: 10px;";
  
            const title = document.createElement("div");
            title.textContent = book.item_id;
  
            const removeBtn = document.createElement("button");
            removeBtn.textContent = 'Remove From Watchlist';
            removeBtn.onclick = () => removeItem(book.item_id, userId, li);
  
            contentDiv.appendChild(img);
            contentDiv.appendChild(title);
            li.appendChild(contentDiv);
            li.appendChild(removeBtn);
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
  
  function removeItem(title, userId, element) {
    fetch(`/removeFromWatchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title, userId: userId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        alert('Item removed successfully');
        element.remove();
      } else {
        alert('Failed to remove item');
      }
    })
    .catch(error => console.error('Error removing item:', error));
  }  