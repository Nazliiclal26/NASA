document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchFilm");
    const searchResult = document.getElementById("searchResult");
  
    searchButton.addEventListener("click", async () => {
      const title = document.getElementById("searchTitle").value;
      console.log("Search button clicked with title:", title); // Log when the button is clicked
  
      if (!title) {
        searchResult.innerText = "Please enter a film title.";
        return;
      }
  
      try {
        console.log("Sending request to /groupSearch"); // Log before sending the request
  
        const response = await axios.get(`/groupSearch`, {
          params: { title }
        });
  
        console.log("Response received:", response.data); // Log the response data
  
        const data = response.data;
  
        searchResult.innerHTML = `
          <h3>${data.title}</h3>
          <p>IMDb Rating: ${data.rating}</p>
          <img src="${data.poster}" alt="${data.title} poster">
        `;
      } catch (error) {
        console.error("Error fetching film:", error);
        searchResult.innerText = "Film not found or an error occurred.";
      }
    });
  });
  