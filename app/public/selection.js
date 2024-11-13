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
      //console.log(groupCodeData.userId);

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

    //console.log(groupData);

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

  let catalogLoading = document.getElementById("catalog");
  catalogLoading.textContent = "Loading...";

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
            //console.log(genreList[randomGenre]);
            let movies = genreList[randomGenre];
            let randomInt = Math.floor(Math.random() * 5);
            let title = movies[randomInt];

            //console.log(title);

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

          //console.log(movieApiData);

          let catalog = document.getElementById("catalog");
          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Movies by Preferences</div>
  <div id="listings">
    <div class="listing" id="one">
      <div class="poster">
      <img src="${movieApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${movieApiData[0][1]}</div>
      <div class="miniTitle">${movieApiData[0][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[0][3]}</div>
        <div class="watchlistButton" id="oneTitle">+</div>
      </div>
    </div>
    <div class="listing" id="two">
      <div class="poster">
      <img src="${movieApiData[1][0]}"/>
      </div>
      <div class="title" id="twoTitle">${movieApiData[1][1]}</div>
      <div class="miniTitle">${movieApiData[1][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[1][3]}</div>
        <div class="watchlistButton" id="twoTitle">+</div>
      </div>
    </div>
    <div class="listing" id="three">
      <div class="poster">
      <img src="${movieApiData[2][0]}"/>
      </div>
      <div class="title" id="threeTitle">${movieApiData[2][1]}</div>
      <div class="miniTitle">${movieApiData[2][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[2][3]}</div>
        <div class="watchlistButton" id="threeTitle">+</div>
      </div>
    </div>
    <div class="listing" id="four">
      <div class="poster">
      <img src="${movieApiData[3][0]}"/>
      </div>
      <div class="title" id="fourTitle">${movieApiData[3][1]}</div>
      <div class="miniTitle">${movieApiData[3][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[3][3]}</div>
        <div class="watchlistButton" id="fourTitle">+</div>
      </div>
    </div>
    <div class="listing" id="five">
      <div class="poster">
      <img src="${movieApiData[4][0]}"/>
      </div>
      <div class="title" id="fiveTitle">${movieApiData[4][1]}</div>
      <div class="miniTitle">${movieApiData[4][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[4][3]}</div>
        <div class="watchlistButton" id="fiveTitle">+</div>
      </div>
    </div>
  </div>
          `;
          let watchlist = document.querySelectorAll(".watchlistButton");
          watchlist.forEach((but) => {
            but.addEventListener("click", () => {
              let productID = but.id;
              let titleID = document.querySelector(`.title#${productID}`);
              let productTitle = titleID.textContent;

              let productInfo = {
                type: "movies",
                title: productTitle,
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
                    alert(data.message);
                  } else {
                    alert(data.message);
                  }
                });
            });
          });

          //console.log(randomGenre);
        } else {
          let genres = [
            "action",
            "adventure",
            "animation",
            "biography",
            "comedy",
            "crime",
            "documentary",
            "drama",
            "family",
            "fantasy",
            "noir",
            "history",
            "horror",
            "music",
            "musical",
            "mystery",
            "romance",
            "scifi",
            "short",
            "sport",
            "superhero",
            "thriller",
            "war",
            "western",
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
            //console.log(genre);
            let movies = genreList[genre];
            let randomInt = Math.floor(Math.random() * movies.length);
            let title = movies[randomInt];

            //console.log(title);

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

          //console.log(movieApiData);

          let catalog = document.getElementById("catalog");
          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Random Movies</div>
  <div id="listings">
    <div class="listing" id="one">
      <div class="poster">
      <img src="${movieApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${movieApiData[0][1]}</div>
      <div class="miniTitle">${movieApiData[0][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[0][3]}</div>
        <div class="watchlistButton" id="oneTitle">+</div>
      </div>
    </div>
    <div class="listing" id="two">
      <div class="poster">
      <img src="${movieApiData[1][0]}"/>
      </div>
      <div class="title" id="twoTitle">${movieApiData[1][1]}</div>
      <div class="miniTitle">${movieApiData[1][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[1][3]}</div>
        <div class="watchlistButton" id="twoTitle">+</div>
      </div>
    </div>
    <div class="listing" id="three">
      <div class="poster">
      <img src="${movieApiData[2][0]}"/>
      </div>
      <div class="title" id="threeTitle">${movieApiData[2][1]}</div>
      <div class="miniTitle">${movieApiData[2][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[2][3]}</div>
        <div class="watchlistButton" id="threeTitle">+</div>
      </div>
    </div>
    <div class="listing" id="four">
      <div class="poster">
      <img src="${movieApiData[3][0]}"/>
      </div>
      <div class="title" id="fourTitle">${movieApiData[3][1]}</div>
      <div class="miniTitle">${movieApiData[3][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[3][3]}</div>
        <div class="watchlistButton" id="fourTitle">+</div>
      </div>
    </div>
    <div class="listing" id="five">
      <div class="poster">
      <img src="${movieApiData[4][0]}"/>
      </div>
      <div class="title" id="fiveTitle">${movieApiData[4][1]}</div>
      <div class="miniTitle">${movieApiData[4][2]}</div>
      <div class="subBlock">
        <div class="rating">${movieApiData[4][3]}</div>
        <div class="watchlistButton" id="fiveTitle">+</div>
      </div>
    </div>
  </div>
          `;
          let watchlist = document.querySelectorAll(".watchlistButton");
          watchlist.forEach((but) => {
            but.addEventListener("click", () => {
              let productID = but.id;
              let titleID = document.querySelector(`.title#${productID}`);
              let productTitle = titleID.textContent;

              let productInfo = {
                type: "movies",
                title: productTitle,
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
                    alert(data.message);
                  } else {
                    alert(data.message);
                  }
                });
            });
          });
        }
      } else {
        alert(data.message);
      }
    });
}

async function populateCatalogBooks() {
  let userId = localStorage.getItem("userId");
  let genreList = {
    action: [
      "The Bourne Identity by Robert Ludlum",
      "Patriot Games by Tom Clancy",
      "Kill Decision by Daniel Suarez",
      "Scarecrow by Matthew Reilly",
      "The Hunt for Red October by Tom Clancy",
      "The Lions of Lucerne by Brad Thor",
      "Term Limits by Vince Flynn",
      "I Am Pilgrim by Terry Hayes",
      "Transfer of Power by Vince Flynn",
      "Without Remorse by Tom Clancy",
    ],
    adventure: [
      "The Adventures of Huckleberry Finn by Mark Twain",
      "Treasure Island by Robert Louis Stevenson",
      "The Call of the Wild by Jack London",
      "Journey to the Center of the Earth by Jules Verne",
      "Around the World in Eighty Days by Jules Verne",
      "Life of Pi by Yann Martel",
      "Into the Wild by Jon Krakauer",
      "The Lost City of Z by David Grann",
      "Moby-Dick by Herman Melville",
      "King Solomon's Mines by H. Rider Haggard",
    ],
    animation: [
      "Alice's Adventures in Wonderland by Lewis Carroll",
      "Coraline by Neil Gaiman",
      "The Jungle Book by Rudyard Kipling",
      "The Invention of Hugo Cabret by Brian Selznick",
      "The Little Prince by Antoine de Saint-Exupéry",
      "Matilda by Roald Dahl",
      "Charlotte's Web by E.B. White",
      "Winnie-the-Pooh by A.A. Milne",
      "Howl's Moving Castle by Diana Wynne Jones",
      "Fantastic Mr. Fox by Roald Dahl",
    ],
    biography: [
      "Steve Jobs by Walter Isaacson",
      "Becoming by Michelle Obama",
      "Alexander Hamilton by Ron Chernow",
      "The Diary of a Young Girl by Anne Frank",
      "Einstein: His Life and Universe by Walter Isaacson",
      "The Wright Brothers by David McCullough",
      "Long Walk to Freedom by Nelson Mandela",
      "Educated by Tara Westover",
      "When Breath Becomes Air by Paul Kalanithi",
      "I Know Why the Caged Bird Sings by Maya Angelou",
    ],
    comedy: [
      "Good Omens by Neil Gaiman & Terry Pratchett",
      "Catch-22 by Joseph Heller",
      "The Hitchhiker's Guide to the Galaxy by Douglas Adams",
      "Bossypants by Tina Fey",
      "Bridget Jones's Diary by Helen Fielding",
      "Me Talk Pretty One Day by David Sedaris",
      "The Importance of Being Earnest by Oscar Wilde",
      "Yes Please by Amy Poehler",
      "The Princess Bride by William Goldman",
      "Where'd You Go, Bernadette by Maria Semple",
    ],
    crime: [
      "The Girl with the Dragon Tattoo by Stieg Larsson",
      "Gone Girl by Gillian Flynn",
      "Big Little Lies by Liane Moriarty",
      "The Silence of the Lambs by Thomas Harris",
      "In the Woods by Tana French",
      "The Godfather by Mario Puzo",
      "The Big Sleep by Raymond Chandler",
      "The Maltese Falcon by Dashiell Hammett",
      "Sharp Objects by Gillian Flynn",
      "I Am Watching You by Teresa Driscoll",
    ],
    documentary: [
      "Sapiens by Yuval Noah Harari",
      "Into Thin Air by Jon Krakauer",
      "The Immortal Life of Henrietta Lacks by Rebecca Skloot",
      "Educated by Tara Westover",
      "The Devil in the White City by Erik Larson",
      "Unbroken by Laura Hillenbrand",
      "The Sixth Extinction by Elizabeth Kolbert",
      "Fast Food Nation by Eric Schlosser",
      "Hiroshima by John Hersey",
      "A Brief History of Time by Stephen Hawking",
    ],
    drama: [
      "To Kill a Mockingbird by Harper Lee",
      "Pride and Prejudice by Jane Austen",
      "The Great Gatsby by F. Scott Fitzgerald",
      "The Catcher in the Rye by J.D. Salinger",
      "Jane Eyre by Charlotte Brontë",
      "The Road by Cormac McCarthy",
      "The Book Thief by Markus Zusak",
      "Wuthering Heights by Emily Brontë",
      "A Thousand Splendid Suns by Khaled Hosseini",
      "The Kite Runner by Khaled Hosseini",
    ],
    family: [
      "Charlotte's Web by E.B. White",
      "Harry Potter and the Sorcerer's Stone by J.K. Rowling",
      "Matilda by Roald Dahl",
      "The Secret Garden by Frances Hodgson Burnett",
      "Little Women by Louisa May Alcott",
      "The Wind in the Willows by Kenneth Grahame",
      "The Lion, the Witch and the Wardrobe by C.S. Lewis",
      "Anne of Green Gables by L.M. Montgomery",
      "The BFG by Roald Dahl",
      "Wonder by R.J. Palacio",
    ],
    fantasy: [
      "The Hobbit by J.R.R. Tolkien",
      "Harry Potter and the Goblet of Fire by J.K. Rowling",
      "The Name of the Wind by Patrick Rothfuss",
      "A Game of Thrones by George R.R. Martin",
      "The Way of Kings by Brandon Sanderson",
      "American Gods by Neil Gaiman",
      "The Golden Compass by Philip Pullman",
      "Good Omens by Neil Gaiman & Terry Pratchett",
      "The Lies of Locke Lamora by Scott Lynch",
      "Mistborn by Brandon Sanderson",
    ],
    noir: [
      "The Big Sleep by Raymond Chandler",
      "The Maltese Falcon by Dashiell Hammett",
      "Farewell, My Lovely by Raymond Chandler",
      "In a Lonely Place by Dorothy B. Hughes",
      "The Postman Always Rings Twice by James M. Cain",
      "Double Indemnity by James M. Cain",
      "L.A. Confidential by James Ellroy",
      "Sin City by Frank Miller",
      "The Black Dahlia by James Ellroy",
      "Murder on the Orient Express by Agatha Christie",
    ],
    history: [
      "Team of Rivals by Doris Kearns Goodwin",
      "The Guns of August by Barbara Tuchman",
      "The Wright Brothers by David McCullough",
      "1776 by David McCullough",
      "The Diary of a Young Girl by Anne Frank",
      "The Rise and Fall of the Third Reich by William L. Shirer",
      "Alexander Hamilton by Ron Chernow",
      "The Devil in the White City by Erik Larson",
      "The Immortal Life of Henrietta Lacks by Rebecca Skloot",
      "John Adams by David McCullough",
    ],
    horror: [
      "The Shining by Stephen King",
      "Dracula by Bram Stoker",
      "Frankenstein by Mary Shelley",
      "Bird Box by Josh Malerman",
      "The Exorcist by William Peter Blatty",
      "House of Leaves by Mark Z. Danielewski",
      "The Haunting of Hill House by Shirley Jackson",
      "Hell House by Richard Matheson",
      "The Silence of the Lambs by Thomas Harris",
      "The Amityville Horror by Jay Anson",
    ],
    music: [
      "Just Kids by Patti Smith",
      "Chronicles by Bob Dylan",
      "Scar Tissue by Anthony Kiedis",
      "Life by Keith Richards",
      "The Dirt by Mötley Crüe",
      "Cash by Johnny Cash",
      "Born to Run by Bruce Springsteen",
      "Wildflower by Drew Barrymore",
      "Girl in a Band by Kim Gordon",
      "Unknown Pleasures by Peter Hook",
    ],
    musical: [
      "West Side Story by Irving Shulman",
      "The Phantom of the Opera by Gaston Leroux",
      "Wicked by Gregory Maguire",
      "Les Misérables by Victor Hugo",
      "Hamilton: The Revolution by Lin-Manuel Miranda",
      "Sweeney Todd by Christopher Bond",
      "Jesus Christ Superstar by Tim Rice & Andrew Lloyd Webber",
      "Rent by Jonathan Larson",
      "Chicago by Maurine Dallas Watkins",
      "Cabaret by Joe Masteroff",
    ],
    mystery: [
      "Gone Girl by Gillian Flynn",
      "The Girl with the Dragon Tattoo by Stieg Larsson",
      "Big Little Lies by Liane Moriarty",
      "Sharp Objects by Gillian Flynn",
      "In the Woods by Tana French",
      "Murder on the Orient Express by Agatha Christie",
      "And Then There Were None by Agatha Christie",
      "The Da Vinci Code by Dan Brown",
      "Rebecca by Daphne du Maurier",
      "The Silent Patient by Alex Michaelides",
    ],
    romance: [
      "Pride and Prejudice by Jane Austen",
      "The Notebook by Nicholas Sparks",
      "Outlander by Diana Gabaldon",
      "Me Before You by Jojo Moyes",
      "Twilight by Stephenie Meyer",
      "The Time Traveler's Wife by Audrey Niffenegger",
      "Jane Eyre by Charlotte Brontë",
      "Atonement by Ian McEwan",
      "Normal People by Sally Rooney",
      "The Hating Game by Sally Thorne",
    ],
    scifi: [
      "Dune by Frank Herbert",
      "Neuromancer by William Gibson",
      "Ender's Game by Orson Scott Card",
      "Snow Crash by Neal Stephenson",
      "The Left Hand of Darkness by Ursula K. Le Guin",
      "Hyperion by Dan Simmons",
      "The War of the Worlds by H.G. Wells",
      "Foundation by Isaac Asimov",
      "The Expanse by James S.A. Corey",
      "The Three-Body Problem by Liu Cixin",
    ],
    short: [
      "Interpreter of Maladies by Jhumpa Lahiri",
      "Nine Stories by J.D. Salinger",
      "Dubliners by James Joyce",
      "Stories of Your Life and Others by Ted Chiang",
      "The Lottery by Shirley Jackson",
      "Tenth of December by George Saunders",
      "Will You Please Be Quiet, Please? by Raymond Carver",
      "What We Talk About When We Talk About Love by Raymond Carver",
      "Her Body and Other Parties by Carmen Maria Machado",
      "The Thing Around Your Neck by Chimamanda Ngozi Adichie",
    ],
    sport: [
      "Moneyball by Michael Lewis",
      "Friday Night Lights by H.G. Bissinger",
      "The Boys in the Boat by Daniel James Brown",
      "Open by Andre Agassi",
      "Seabiscuit by Laura Hillenbrand",
      "The Blind Side by Michael Lewis",
      "A Life Well Played by Arnold Palmer",
      "Unbroken by Laura Hillenbrand",
      "Shoe Dog by Phil Knight",
      "Running with the Buffaloes by Chris Lear",
    ],
    superhero: [
      "Watchmen by Alan Moore",
      "The Dark Knight Returns by Frank Miller",
      "V for Vendetta by Alan Moore",
      "Batman: Year One by Frank Miller",
      "All-Star Superman by Grant Morrison",
      "Kingdom Come by Mark Waid",
      "The Killing Joke by Alan Moore",
      "Civil War by Mark Millar",
      "Old Man Logan by Mark Millar",
      "Spider-Man: Blue by Jeph Loeb",
    ],
    thriller: [
      "The Girl on the Train by Paula Hawkins",
      "Gone Girl by Gillian Flynn",
      "The Girl with the Dragon Tattoo by Stieg Larsson",
      "Sharp Objects by Gillian Flynn",
      "Before I Go to Sleep by S.J. Watson",
      "The Silent Patient by Alex Michaelides",
      "Big Little Lies by Liane Moriarty",
      "In the Woods by Tana French",
      "Dark Places by Gillian Flynn",
      "Behind Closed Doors by B.A. Paris",
    ],
    war: [
      "All Quiet on the Western Front by Erich Maria Remarque",
      "The Things They Carried by Tim O'Brien",
      "Catch-22 by Joseph Heller",
      "Slaughterhouse-Five by Kurt Vonnegut",
      "Band of Brothers by Stephen E. Ambrose",
      "The Naked and the Dead by Norman Mailer",
      "The Yellow Birds by Kevin Powers",
      "The Red Badge of Courage by Stephen Crane",
      "Black Hawk Down by Mark Bowden",
      "Matterhorn by Karl Marlantes",
    ],
    western: [
      "Lonesome Dove by Larry McMurtry",
      "True Grit by Charles Portis",
      "Blood Meridian by Cormac McCarthy",
      "The Big Sky by A.B. Guthrie Jr.",
      "Riders of the Purple Sage by Zane Grey",
      "Shane by Jack Schaefer",
      "The Sisters Brothers by Patrick deWitt",
      "The Virginian by Owen Wister",
      "Doc by Mary Doria Russell",
      "The Assassination of Jesse James by Ron Hansen",
    ],
  };
  catalogLoading = document.getElementById("catalog");
  catalogLoading.textContent = "Loading...";

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

          let selectedBooks = [];
          let bookApiData = [];

          for (let i = 0; i < 5; i++) {
            //console.log(genreList[randomGenre]);
            let books = genreList[randomGenre];
            let randomInt = Math.floor(Math.random() * 5);
            let title = books[randomInt];

            //console.log(title);

            try {
              let response = await fetch(
                `/groupSearchBook?title=${encodeURIComponent(title)}`
              );
              if (!response.ok) throw new Error("Book not found");

              let data = await response.json();
              let info = [data.poster, data.title, data.authors, data.rating];
              bookApiData.push(info);
            } catch (error) {
              searchResult.innerText = "Book not found or an error occurred.";
              console.error("Error fetching book:", error);
            }

            selectedBooks.push(books[randomInt]);
          }

          //console.log(bookApiData);

          let catalog = document.getElementById("catalog");
          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Books by Preferences</div>
  <div id="listings">
    <div class="listing" id="1">
      <div class="poster">
      <img src="${bookApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${bookApiData[0][1]}</div>
      <div class="miniTitle">${bookApiData[0][2]}</div>
      <div class="subBlock">
        <div class="rating">${bookApiData[0][3]}/5</div>
        <div class="watchlistButton" id="oneTitle">+</div>
      </div>
    </div>
    <div class="listing" id="2">
      <div class="poster">
      <img src="${bookApiData[1][0]}"/>
      </div>
      <div class="title" id="twoTitle">${bookApiData[1][1]}</div>
      <div class="miniTitle">${bookApiData[1][2]}</div>
      <div class="subBlock">
        <div class="rating">${bookApiData[1][3]}/5</div>
        <div class="watchlistButton" id="twoTitle">+</div>
      </div>
    </div>
    <div class="listing" id="3">
      <div class="poster">
      <img src="${bookApiData[2][0]}"/>
      </div>
      <div class="title" id="threeTitle">${bookApiData[2][1]}</div>
      <div class="miniTitle">${bookApiData[2][2]}</div>
      <div class="subBlock">
        <div class="rating">${bookApiData[2][3]}/5</div>
        <div class="watchlistButton" id="threeTitle">+</div>
      </div>
    </div>
    <div class="listing" id="4">
      <div class="poster">
      <img src="${bookApiData[3][0]}"/>
      </div>
      <div class="title" id="fourTitle">${bookApiData[3][1]}</div>
      <div class="miniTitle">${bookApiData[3][2]}</div>
      <div class="subBlock">
        <div class="rating">${bookApiData[3][3]}/5</div>
        <div class="watchlistButton" id="fourTitle">+</div>
      </div>
    </div>
    <div class="listing" id="5">
      <div class="poster">
      <img src="${bookApiData[4][0]}"/>
      </div>
      <div class="title" id="fiveTitle">${bookApiData[4][1]}</div>
      <div class="miniTitle">${bookApiData[4][2]}</div>
      <div class="subBlock">
        <div class="rating">${bookApiData[4][3]}/5</div>
        <div class="watchlistButton" id="fiveTitle">+</div>
      </div>
    </div>
  </div>
          `;
          let watchlist = document.querySelectorAll(".watchlistButton");
          watchlist.forEach((but) => {
            but.addEventListener("click", () => {
              let productID = but.id;
              let titleID = document.querySelector(`.title#${productID}`);
              let productTitle = titleID.textContent;

              let productInfo = {
                type: "books",
                title: productTitle,
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
                    alert(data.message);
                  } else {
                    alert(data.message);
                  }
                });
            });
          });
          //console.log(randomGenre);
        } else {
          let genres = [
            "action",
            "adventure",
            "animation",
            "biography",
            "comedy",
            "crime",
            "documentary",
            "drama",
            "family",
            "fantasy",
            "noir",
            "history",
            "horror",
            "music",
            "musical",
            "mystery",
            "romance",
            "scifi",
            "short",
            "sport",
            "superhero",
            "thriller",
            "war",
            "western",
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

          let selectedBooks = [];
          let bookApiData = [];

          for (let i = 0; i < outputGenres.length; i++) {
            let genre = outputGenres[i];
            let books = genreList[genre];
            let randomInt = Math.floor(Math.random() * books.length);
            let title = books[randomInt];

            //console.log(title);

            try {
              let response = await fetch(
                `/groupSearchBook?title=${encodeURIComponent(title)}`
              );
              if (!response.ok) throw new Error("Book not found");

              let data = await response.json();
              let info = [data.poster, data.title, data.authors, data.rating];
              bookApiData.push(info);
            } catch (error) {
              searchResult.innerText = "Book not found or an error occurred.";
              console.error("Error fetching book:", error);
            }

            selectedBooks.push(movies[randomInt]);
          }

          //console.log(bookApiData);

          let catalog = document.getElementById("catalog");
          catalog.innerHTML = `
          <div id="catalogBlock">
            <div id="listingTitle">Random Books</div>
            <div id="listings">
              <div class="listing" id="1">
                <div class="poster">
                <img src="${bookApiData[0][0]}"/>
                </div>
                <div class="title" id="oneTitle">${bookApiData[0][1]}</div>
                <div class="miniTitle">${bookApiData[0][2]}</div>
                <div class="subBlock">
                  <div class="rating">${bookApiData[0][3]}/5</div>
                  <div class="watchlistButton" id="oneTitle">+</div>
                </div>
              </div>
              <div class="listing" id="2">
                <div class="poster">
                <img src="${bookApiData[1][0]}"/>
                </div>
                <div class="title" id="twoTitle">${bookApiData[1][1]}</div>
                <div class="miniTitle">${bookApiData[1][2]}</div>
                <div class="subBlock">
                  <div class="rating">${bookApiData[1][3]}/5</div>
                  <div class="watchlistButton" id="twoTitle">+</div>
                </div>
              </div>
              <div class="listing" id="3">
                <div class="poster">
                <img src="${bookApiData[2][0]}"/>
                </div>
                <div class="title" id="threeTitle">${bookApiData[2][1]}</div>
                <div class="miniTitle">${bookApiData[2][2]}</div>
                <div class="subBlock">
                  <div class="rating">${bookApiData[2][3]}/5</div>
                  <div class="watchlistButton" id="threeTitle">+</div>
                </div>
              </div>
              <div class="listing" id="4">
                <div class="poster">
                <img src="${bookApiData[3][0]}"/>
                </div>
                <div class="title" id="fourTitle">${bookApiData[3][1]}</div>
                <div class="miniTitle">${bookApiData[3][2]}</div>
                <div class="subBlock">
                  <div class="rating">${bookApiData[3][3]}/5</div>
                  <div class="watchlistButton" id="fourTitle">+</div>
                </div>
              </div>
              <div class="listing" id="5">
                <div class="poster">
                <img src="${bookApiData[4][0]}"/>
                </div>
                <div class="title" id="fiveTitle">${bookApiData[4][1]}</div>
                <div class="miniTitle">${bookApiData[4][2]}</div>
                <div class="subBlock">
                  <div class="rating">${bookApiData[4][3]}/5</div>
                  <div class="watchlistButton" id="fiveTitle">+</div>
                </div>
              </div>
            </div>
                    `;
          let watchlist = document.querySelectorAll(".watchlistButton");
          watchlist.forEach((but) => {
            but.addEventListener("click", () => {
              let productID = but.id;
              let titleID = document.querySelector(`.title#${productID}`);
              let productTitle = titleID.textContent;

              let productInfo = {
                type: "books",
                title: productTitle,
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
                    alert(data.message);
                  } else {
                    alert(data.message);
                  }
                });
            });
          });
        }
      } else {
        alert(data.message);
      }
    });
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
populateCatalogBooks();
