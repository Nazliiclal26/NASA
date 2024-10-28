/*
ADD YOUR CLIENT-SIDE CODE FOR search.html HERE
*/
let button = document.getElementById("submit");
button.addEventListener("click", () => {
  let genre = document.getElementById("genre").value;

  fetch(`/search?genre=${genre}`)
  .then((response) => response.json())
  .then((data) => {
        let books = data.rows;
        let tableBody = document.getElementById("books");
        let message = document.getElementById("message");
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        message.textContent = "";
  
        if (books.length === 0){
          message.textContent = "No books found";
        } 
        else {
          books.forEach((i) => {
            let row = document.createElement("tr");
  
            let bookTitle = document.createElement("td");
            bookTitle.textContent = i.title;
  
            let bookGenre = document.createElement("td");
            bookGenre.textContent = i.genre;
  
            let bookQuality = document.createElement("td");
            if (i.quality === true) {
                bookQuality.textContent = "Yes";
            } 
            else {
                bookQuality.textContent = "No";
            }
  
            row.appendChild(bookTitle);
            row.appendChild(bookGenre);
            row.appendChild(bookQuality);
  
            tableBody.appendChild(row);
        });
    }
  })
    .catch((error) => {
      console.error(error);
    });
});
