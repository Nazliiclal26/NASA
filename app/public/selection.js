let groupButton = document.getElementById("modalButton");
let mainCloseButton = document.getElementById("mainGroupModalButton");
let joinCloseButton = document.getElementById("joinGroupModalButton");
let addCloseButton = document.getElementById("createGroupModalButton");

let mainModal = document.getElementById("mainModal");
let joinModal = document.getElementById("joinModal");
let createModal = document.getElementById("createModal");

let joinButton = document.getElementById("joinButton");
let addButton = document.getElementById("addButton");

let joinGroupHome = document.getElementById("joinGroupHome");
let joinAddButton = document.getElementById("joinAddButton");

let createGroupHome = document.getElementById("createHomeButton");
let createJoinButton = document.getElementById("createJoinButton");

let accountButton = document.getElementById("account");
let logoutButton = document.getElementById("logout");

let searchSection = document.getElementById("searchBox");
let searchButton = document.getElementById("searchFilm");
let searchResult = document.getElementById("searchResult");

let booksButton = document.getElementById("books");
let moviesButton = document.getElementById("movies");

searchButton.addEventListener("click", async () => {
  let title = document.getElementById("search").value;

  if (!title) {
    searchResult.innerText = "Please enter a film title.";
    return;
  }

  try {
    let response = await fetch(
      `/groupSearch?title=${encodeURIComponent(title)}`
    );
    if (!response.ok) throw new Error("Film not found");

    let data = await response.json();
    searchResult.innerHTML = `
      <div class="film-card">
        <img src="${data.poster}" alt="${data.title} poster">
        <button class="watchlist-btn" data-title="${data.title}" data-genre="${data.genre}">+</button>
        <h3>${data.title}</h3>
        <p>IMDb Rating: ${data.rating}</p>
        <p>Genre: ${data.genre}</p>x
        <p>Plot: ${data.plot}</p>
      </div>
    `;
  } catch (error) {
    searchResult.innerText = "Film not found or an error occurred.";
    console.error("Error fetching film:", error);
  }
});

accountButton.addEventListener("click", () => {
  window.location.href = "account.html";
});

function closeModals() {
  mainModal.classList.add("hidden");
  joinModal.classList.add("hidden");
  createModal.classList.add("hidden");
}

groupButton.addEventListener("click", () => {
  mainModal.classList.toggle("hidden");
});

joinButton.addEventListener("click", () => {
  joinModal.classList.toggle("hidden");
});

addButton.addEventListener("click", () => {
  createModal.classList.toggle("hidden");
});

mainCloseButton.addEventListener("click", () => {
  closeModals();
});

joinCloseButton.addEventListener("click", () => {
  closeModals();
});

addCloseButton.addEventListener("click", () => {
  closeModals();
});

joinGroupHome.addEventListener("click", () => {
  closeModals();
  mainModal.classList.toggle("hidden");
});

joinAddButton.addEventListener("click", () => {
  closeModals();
  createModal.classList.toggle("hidden");
});

createGroupHome.addEventListener("click", () => {
  closeModals();
  mainModal.classList.toggle("hidden");
});

createJoinButton.addEventListener("click", () => {
  closeModals();
  joinModal.classList.toggle("hidden");
});

function processJoinModal() {
  let groupCodeInput = document.getElementById("code");
  let randomButton = document.getElementById("random");
  let joinGroupButton = document.getElementById("joinGroup");

  let isRandom = false;

  groupCodeInput.addEventListener("input", () => {
    if (groupCodeInput.value.trim() !== "") {
      randomButton.classList.remove("randomClicked");
      isRandom = false;
    }
  });

  randomButton.addEventListener("click", () => {
    randomButton.classList.toggle("randomClicked");
    groupCodeInput.value = "";
    if (randomButton.classList.contains("randomClicked")) {
      isRandom = true;
    } else {
      isRandom = false;
    }
  });

  joinGroupButton.addEventListener("click", () => {
    handleJoinGroup();
  });

  function handleJoinGroup() {
    let groupCodeVal = groupCodeInput.value.trim();

    if (isRandom) {
      let groupCodeData = {
        type: "random",
        code: "",
        userId: localStorage.getItem("userId"),
      };
      console.log(groupCodeData.userId);

      alert("join random");
      fetch("/joinGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupCodeData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            closeModals();
            mainModal.classList.remove("hidden");
            displayGroups();
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (groupCodeVal !== "") {
      let groupCodeData = {
        type: "code",
        code: groupCodeVal,
        userId: localStorage.getItem("userId"),
      };
      alert(`joining with code ${groupCodeVal}`);
      fetch("/joinGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupCodeData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            closeModals();
            mainModal.classList.remove("hidden");
            displayGroups();
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      alert("please enter group code or select random");
    }
  }
}

function processCreateModal() {
  let groupNameInput = document.getElementById("name");
  let createGroupButton = document.getElementById("create");

  let groupType = null;
  let access = null;

  let groupTypeButtons = document.querySelectorAll(
    "#typeButtonsModalType .groupButtons"
  );

  groupTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      groupTypeButtons.forEach((each) =>
        each.classList.remove("clickedGroupButton")
      );
      button.classList.add("clickedGroupButton");
      groupType = button.textContent.trim().toLowerCase();
    });
  });

  let accessButtons = document.querySelectorAll(
    "#typeButtonsModalAccess .groupButtons"
  );
  accessButtons.forEach((button) => {
    button.addEventListener("click", () => {
      accessButtons.forEach((each) =>
        each.classList.remove("clickedGroupButton")
      );
      button.classList.add("clickedGroupButton");
      access = button.textContent.trim().toLowerCase();
    });
  });

  createGroupButton.addEventListener("click", () => {
    let groupName = groupNameInput ? groupNameInput.value.trim() : null;

    if (!groupName || !groupType || !access) {
      alert("Missing input");
      return;
    }

    let groupData = {
      groupName: groupName,
      groupType: groupType,
      access: access,
      leaderId: localStorage.getItem("userId"),
    };

    console.log(groupData);

    fetch("/createGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          // go to home
          closeModals();
          mainModal.classList.remove("hidden");
          displayGroups();
        } else {
          console.log(data);
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

processJoinModal();
processCreateModal();

async function displayGroups() {
  let groupsDiv = document.getElementById("groups");
  let userId = localStorage.getItem("userId");

  fetch(`/getGroups/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        let myGroups = [];

        let divStruct = ``;

        data.rows.forEach((row) => {
          myGroups.push(row.group_name);
          divStruct += `
          <div>
            <a href='/${row.group_type}Group/${row.group_name}'>${row.group_name}</a>
          </div>
          `;
        });
        groupsDiv.innerHTML = divStruct;
      } else {
        alert(data.message);
      }
    });
}

logoutButton.addEventListener("click", () => {
  localStorage.clear("userId");
  window.location.href = "/";
});

async function addGreeting() {
  let greetBlock = document.getElementById("greeting");
  let userId = localStorage.getItem("userId");

  fetch(`/getUsername/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        greetBlock.textContent = "Hi, " + data.rows[0].username + "!";
      } else {
        alert(data.message);
      }
    });
}

async function populateCatalog() {
  let userId = localStorage.getItem("userId");
  let genreList = {
    action: [
      "Mad Max: Fury Road",
      "Die Hard",
      "John Wick",
      "The Dark Knight",
      "Gladiator",
      "The Avengers",
      "Terminator 2: Judgment Day",
      "Inception",
      "The Matrix",
      "Mission: Impossible – Fallout",
    ],
    adventure: [
      "Indiana Jones: Raiders of the Lost Ark",
      "The Lord of the Rings: The Fellowship of the Ring",
      "Pirates of the Caribbean: The Curse of the Black Pearl",
      "Jurassic Park",
      "Star Wars: Episode IV – A New Hope",
      "Avatar",
      "The Revenant",
      "Life of Pi",
      "The Princess Bride",
      "Harry Potter and the Sorcerer's Stone",
    ],
    animation: [
      "Toy Story",
      "Spirited Away",
      "Finding Nemo",
      "The Lion King",
      "Frozen",
      "Shrek",
      "Up",
      "Inside Out",
      "Coco",
      "Zootopia",
    ],
    biography: [
      "The Social Network",
      "Schindler's List",
      "A Beautiful Mind",
      "Bohemian Rhapsody",
      "The Imitation Game",
      "Selma",
      "Gandhi",
      "The King's Speech",
      "12 Years a Slave",
      "Catch Me If You Can",
    ],
    comedy: [
      "Superbad",
      "The Hangover",
      "Step Brothers",
      "Anchorman: The Legend of Ron Burgundy",
      "Bridesmaids",
      "Groundhog Day",
      "Monty Python and the Holy Grail",
      "Dumb and Dumber",
      "Mean Girls",
      "Ferris Bueller's Day Off",
    ],
    crime: [
      "The Godfather",
      "Pulp Fiction",
      "The Departed",
      "Goodfellas",
      "Heat",
      "Seven",
      "The Silence of the Lambs",
      "Reservoir Dogs",
      "Taxi Driver",
      "No Country for Old Men",
    ],
    documentary: [
      "Planet Earth II",
      "Free Solo",
      "13th",
      "Won't You Be My Neighbor?",
      "The Last Dance",
      "Blackfish",
      "Jiro Dreams of Sushi",
      "Supersize Me",
      "Bowling for Columbine",
      "March of the Penguins",
    ],
    drama: [
      "Forrest Gump",
      "Fight Club",
      "The Shawshank Redemption",
      "The Godfather Part II",
      "American Beauty",
      "The Pursuit of Happyness",
      "La La Land",
      "Moonlight",
      "The Green Mile",
      "The Revenant",
    ],
    family: [
      "Frozen",
      "The Incredibles",
      "Harry Potter and the Sorcerer's Stone",
      "The Lion King",
      "Finding Nemo",
      "Moana",
      "Tangled",
      "Monsters, Inc.",
      "Beauty and the Beast",
      "Coco",
    ],
    fantasy: [
      "The Lord of the Rings: The Return of the King",
      "Harry Potter and the Goblet of Fire",
      "Pan's Labyrinth",
      "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe",
      "Harry Potter and the Philosopher's Stone",
      "The Shape of Water",
      "Stardust",
      "Alice in Wonderland",
      "The Princess Bride",
      "The Hobbit: An Unexpected Journey",
    ],
    noir: [
      "Double Indemnity",
      "The Maltese Falcon",
      "Chinatown",
      "Laura",
      "Out of the Past",
      "Sunset Boulevard",
      "The Big Sleep",
      "Touch of Evil",
      "Gilda",
      "Memento",
    ],
    history: [
      "Schindler's List",
      "Braveheart",
      "Gladiator",
      "12 Years a Slave",
      "Dunkirk",
      "Lincoln",
      "The Imitation Game",
      "The King's Speech",
      "Apollo 13",
      "Saving Private Ryan",
    ],
    horror: [
      "The Exorcist",
      "Get Out",
      "Hereditary",
      "A Nightmare on Elm Street",
      "The Shining",
      "It",
      "The Conjuring",
      "Halloween",
      "Alien",
      "The Silence of the Lambs",
    ],
    music: [
      "Amadeus",
      "Walk the Line",
      "Bohemian Rhapsody",
      "La La Land",
      "Whiplash",
      "Ray",
      "Inside Llewyn Davis",
      "Across the Universe",
      "August Rush",
      "Once",
    ],
    musical: [
      "The Sound of Music",
      "La La Land",
      "West Side Story",
      "Singin' in the Rain",
      "Mamma Mia!",
      "Grease",
      "Chicago",
      "Les Misérables",
      "Into the Woods",
      "Mary Poppins",
    ],
    mystery: [
      "Gone Girl",
      "Zodiac",
      "The Girl with the Dragon Tattoo",
      "Se7en",
      "Mystic River",
      "Rear Window",
      "Shutter Island",
      "Memento",
      "The Prestige",
      "Knives Out",
    ],
    romance: [
      "Titanic",
      "The Notebook",
      "Pride & Prejudice",
      "La La Land",
      "A Walk to Remember",
      "Silver Linings Playbook",
      "Before Sunrise",
      "The Fault in Our Stars",
      "Casablanca",
      "Eternal Sunshine of the Spotless Mind",
    ],
    scifi: [
      "Blade Runner 2049",
      "Inception",
      "Interstellar",
      "The Matrix",
      "Star Wars: Episode IV – A New Hope",
      "The Terminator",
      "Ex Machina",
      "Arrival",
      "Gravity",
      "Her",
    ],
    short: [
      "The Silent Child",
      "Paperman",
      "World of Tomorrow",
      "Bao",
      "Piper",
      "La Luna",
      "Snack Attack",
      "Hair Love",
      "Stutterer",
      "Validation",
    ],
    sport: [
      "Rocky",
      "Raging Bull",
      "Remember the Titans",
      "Moneyball",
      "The Blind Side",
      "Field of Dreams",
      "Hoosiers",
      "Rush",
      "Creed",
      "A League of Their Own",
    ],
    superhero: [
      "The Avengers",
      "Spider-Man: Into the Spider-Verse",
      "Iron Man",
      "Black Panther",
      "Batman Begins",
      "The Dark Knight",
      "Guardians of the Galaxy",
      "Wonder Woman",
      "Deadpool",
      "Thor: Ragnarok",
    ],
    thriller: [
      "Se7en",
      "The Girl with the Dragon Tattoo",
      "Gone Girl",
      "Prisoners",
      "Shutter Island",
      "Zodiac",
      "Fight Club",
      "No Country for Old Men",
      "The Silence of the Lambs",
      "Nightcrawler",
    ],
    war: [
      "Saving Private Ryan",
      "Apocalypse Now",
      "Full Metal Jacket",
      "1917",
      "Platoon",
      "Black Hawk Down",
      "Dunkirk",
      "The Thin Red Line",
      "Letters from Iwo Jima",
      "Hacksaw Ridge",
    ],
    western: [
      "Unforgiven",
      "The Good, the Bad and the Ugly",
      "Django Unchained",
      "True Grit",
      "Once Upon a Time in the West",
      "Tombstone",
      "Butch Cassidy and the Sundance Kid",
      "The Revenant",
      "No Country for Old Men",
      "The Hateful Eight",
    ],
  };

  fetch(`/getGenres/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.status === "success") {
        let genres = data.rows[0].preferred_genres;
        let numGenres = data.rows[0].preferred_genres.length;
        let outputGenres = [];

        if (numGenres > 0) {
          let randomNum = Math.floor(Math.random() * numGenres);
          let randomGenre = genres[randomNum];

          let selectedMovies = [];
          let movieApiData = [];

          for (let i = 0; i < 5; i++) {
            console.log(genreList[randomGenre]);
            let movies = genreList[randomGenre];
            let randomInt = Math.floor(Math.random() * movies.length);
            let title = movies[randomInt];

            console.log(title);

            try {
              let response = await fetch(
                `/groupSearch?title=${encodeURIComponent(title)}`
              );
              if (!response.ok) throw new Error("Film not found");

              let data = await response.json();
              let info = [data.poster, data.title, data.genre, data.rating];
              movieApiData.push(info);
            } catch (error) {
              searchResult.innerText = "Film not found or an error occurred.";
              console.error("Error fetching film:", error);
            }

            selectedMovies.push(movies[randomInt]);
          }

          console.log(movieApiData);

          let catalog = document.getElementById("catalog");
          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Movies by Preferences</div>
  <div id="listings">
    <div class="listing" id="1">
      <div class="poster">
      <img src="${movieApiData[0][0]}"/>
      </div>
      <div class="title" id="1">${movieApiData[0][1]}</div>
      <div class="miniTitle">${movieApiData[0][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[0][3]}</div>
        <div class="watchlistButton" id="1">+</div>
      </div>
    </div>
    <div class="listing" id="2">
      <div class="poster">
      <img src="${movieApiData[1][0]}"/>
      </div>
      <div class="title" id="2">${movieApiData[1][1]}</div>
      <div class="miniTitle">${movieApiData[1][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[1][3]}</div>
        <div class="watchlistButton" id="2">+</div>
      </div>
    </div>
    <div class="listing" id="3">
      <div class="poster">
      <img src="${movieApiData[2][0]}"/>
      </div>
      <div class="title" id="3">${movieApiData[2][1]}</div>
      <div class="miniTitle">${movieApiData[2][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[2][3]}</div>
        <div class="watchlistButton" id="3">+</div>
      </div>
    </div>
    <div class="listing" id="4">
      <div class="poster">
      <img src="${movieApiData[3][0]}"/>
      </div>
      <div class="title" id="4">${movieApiData[3][1]}</div>
      <div class="miniTitle">${movieApiData[3][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[3][3]}</div>
        <div class="watchlistButton" id="4">+</div>
      </div>
    </div>
    <div class="listing" id="5">
      <div class="poster">
      <img src="${movieApiData[4][0]}"/>
      </div>
      <div class="title" id="5">${movieApiData[4][1]}</div>
      <div class="miniTitle">${movieApiData[4][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[4][3]}</div>
        <div class="watchlistButton" id="5">+</div>
      </div>
    </div>
  </div>
          `;

          console.log(randomGenre);
        } else {
          let genres = [
            "Action",
            "Adventure",
            "Animation",
            "Biography",
            "Comedy",
            "Crime",
            "Documentary",
            "Drama",
            "Family",
            "Fantasy",
            "Film Noir",
            "History",
            "Horror",
            "Music",
            "Musical",
            "Mystery",
            "Romance",
            "Sci-Fi",
            "Short",
            "Sport",
            "Superhero",
            "Thriller",
            "War",
            "Western",
          ];
          let numGenres = genres.length;

          for (let i = 0; i < 5; i++) {
            let randomNum = Math.floor(Math.random() * numGenres);
            let randomGenre = genres[randomNum];

            if (!outputGenres.includes(randomGenre)) {
              outputGenres.push(randomGenre);
            } else {
              i--;
            }
          }

          let selectedMovies = [];
          let movieApiData = [];

          for (let i = 0; i < outputGenres.length; i++) {
            let genre = outputGenres[i];
            let movies = genreList[genre];
            let randomInt = Math.floor(Math.random() * movies.length);
            let title = movies[randomInt];

            console.log(title);

            try {
              let response = await fetch(
                `/groupSearch?title=${encodeURIComponent(title)}`
              );
              if (!response.ok) throw new Error("Film not found");

              let data = await response.json();
              let info = [data.poster, data.title, data.genre, data.rating];
              movieApiData.push(info);
            } catch (error) {
              searchResult.innerText = "Film not found or an error occurred.";
              console.error("Error fetching film:", error);
            }

            selectedMovies.push(movies[randomInt]);
          }

          console.log(movieApiData);

          let catalog = document.getElementById("catalog");
          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Random Movies</div>
  <div id="listings">
    <div class="listing" id="1">
      <div class="poster">
      <img src="${movieApiData[0][0]}"/>
      </div>
      <div class="title" id="1">${movieApiData[0][1]}</div>
      <div class="miniTitle">${movieApiData[0][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[0][3]}</div>
        <div class="watchlistButton" id="1">+</div>
      </div>
    </div>
    <div class="listing" id="2">
      <div class="poster">
      <img src="${movieApiData[1][0]}"/>
      </div>
      <div class="title" id="2">${movieApiData[1][1]}</div>
      <div class="miniTitle">${movieApiData[1][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[1][3]}</div>
        <div class="watchlistButton" id="2">+</div>
      </div>
    </div>
    <div class="listing" id="3">
      <div class="poster">
      <img src="${movieApiData[2][0]}"/>
      </div>
      <div class="title" id="3">${movieApiData[2][1]}</div>
      <div class="miniTitle">${movieApiData[2][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[2][3]}</div>
        <div class="watchlistButton" id="3">+</div>
      </div>
    </div>
    <div class="listing" id="4">
      <div class="poster">
      <img src="${movieApiData[3][0]}"/>
      </div>
      <div class="title" id="4">${movieApiData[3][1]}</div>
      <div class="miniTitle">${movieApiData[3][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[3][3]}</div>
        <div class="watchlistButton" id="4">+</div>
      </div>
    </div>
    <div class="listing" id="5">
      <div class="poster">
      <img src="${movieApiData[4][0]}"/>
      </div>
      <div class="title" id="5">${movieApiData[4][1]}</div>
      <div class="miniTitle">${movieApiData[4][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[4][3]}</div>
        <div class="watchlistButton" id="5">+</div>
      </div>
    </div>
  </div>
          `;
        }
      } else {
        alert(data.message);
      }
    });
}

async function populateCatalogBooks() {
  let catalog = document.getElementById("catalog");
  catalog.innerHTML = ``;
}

booksButton.addEventListener("click", () => {
  moviesButton.classList.remove("typeClicked");
  booksButton.classList.add("typeClicked");
  localStorage.setItem("type", "books");
  populateCatalogBooks();
});

moviesButton.addEventListener("click", () => {
  booksButton.classList.remove("typeClicked");
  moviesButton.classList.add("typeClicked");
  localStorage.setItem("type", "movies");
  populateCatalog();
});

displayGroups();
addGreeting();
booksButton.classList.add("typeClicked");
localStorage.setItem("type", "books");
