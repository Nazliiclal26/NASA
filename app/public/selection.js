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
let searchType = document.getElementById("searchType");

let booksButton = document.getElementById("books");
let moviesButton = document.getElementById("movies");

document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem("groupInfo");
});

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
            let type = data.group.group_type;

            let groupCode = data.group.secret_code;

            if (type === "book") {
              window.location.href = `/bookGroup/:${groupCode}`;
            } else {
              window.location.href = `/movieGroup/:${groupCode}`;
            }
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
            let type = data.group.group_type;
            let groupCode = data.group.secret_code;
            if (type === "book") {
              window.location.href = `/bookGroup/:${groupCode}`;
            } else {
              window.location.href = `/movieGroup/:${groupCode}`;
            }
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
  let groupsList = document.getElementById("groupsList");
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
        let colors = ["red", "orange", "green", "blue", "purple"];
        let divStruct = ``;

        data.rows.forEach((row) => {
          myGroups.push(row.group_name);
          let randomColor = colors[Math.floor(Math.random() * colors.length)];
          divStruct += `
          <li>
          <div class="groupItemBox">
            <div class="marker ${randomColor}">
            </div>
            <a class="groupModalLinks" href='/${row.group_type}Group/${row.group_name}'>${row.group_name}</a>
          </div>
            </li>
            <div class="line"> </div>
          `;
        });
        groupsList.innerHTML = divStruct;
      } else {
        alert(data.message);
      }
    });
}

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
          let alreadySelected = [];

          for (let i = 0; i < 5; i++) {
            //console.log(genreList[randomGenre]);
            let movies = genreList[randomGenre];
            let randomInt = Math.floor(Math.random() * 10);

            while (alreadySelected.includes(randomInt)) {
              randomInt = Math.floor(Math.random() * 10);
            }

            alreadySelected.push(randomInt);

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

          let originalTitle1 = movieApiData[0][1];
          let originalTitle2 = movieApiData[1][1];
          let originalTitle3 = movieApiData[2][1];
          let originalTitle4 = movieApiData[3][1];
          let originalTitle5 = movieApiData[4][1];

          let moviePoster1 = movieApiData[0][0];
          let moviePoster2 = movieApiData[1][0];
          let moviePoster3 = movieApiData[2][0];
          let moviePoster4 = movieApiData[3][0];
          let moviePoster5 = movieApiData[4][0];

          let title1 =
            originalTitle1.length > 15
              ? originalTitle1.substring(0, 15) + "..."
              : originalTitle1;

          let title2 =
            originalTitle2.length > 15
              ? originalTitle2.substring(0, 15) + "..."
              : originalTitle2;

          let title3 =
            originalTitle3.length > 15
              ? originalTitle3.substring(0, 15) + "..."
              : originalTitle3;

          let title4 =
            originalTitle4.length > 15
              ? originalTitle4.substring(0, 15) + "..."
              : originalTitle4;

          let title5 =
            originalTitle5.length > 15
              ? originalTitle5.substring(0, 15) + "..."
              : originalTitle5;

          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Movies by Preferences</div>
  <div id="listings">
    <div class="listing" id="one">
      <div class="poster">
      <img src="${movieApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${title1}</div>
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
      <div class="title" id="twoTitle">${title2}</div>
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
      <div class="title" id="threeTitle">${title3}</div>
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
      <div class="title" id="fourTitle">${title4}</div>
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
      <div class="title" id="fiveTitle">${title5}</div>
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
              //let productTitle = titleID.textContent;
              let productTitle;
              let productPoster;
              switch (productID) {
                case "oneTitle":
                  productTitle = originalTitle1;
                  productPoster = moviePoster1;
                  break;
                case "twoTitle":
                  productTitle = originalTitle2;
                  productPoster = moviePoster2;
                  break;
                case "threeTitle":
                  productTitle = originalTitle3;
                  productPoster = moviePoster3;
                  break;
                case "fourTitle":
                  productTitle = originalTitle4;
                  productPoster = moviePoster4;
                  break;
                case "fiveTitle":
                  productTitle = originalTitle5;
                  productPoster = moviePoster5;
                  break;
                default:
                  console.error(
                    "Unexpected ID for watchlist button:",
                    productID
                  );
                  return;
              }

              let productInfo = {
                type: "movies",
                title: productTitle,
                userId: userId,
                poster: productPoster,
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
          let alreadySelected = [];

          for (let i = 0; i < outputGenres.length; i++) {
            let genre = outputGenres[i];
            //console.log(genre);
            let movies = genreList[genre];
            let randomInt = Math.floor(Math.random() * movies.length);

            while (alreadySelected.includes(randomInt)) {
              randomInt = Math.floor(Math.random() * 10);
            }

            alreadySelected.push(randomInt);

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

          let originalTitle1 = movieApiData[0][1];
          let originalTitle2 = movieApiData[1][1];
          let originalTitle3 = movieApiData[2][1];
          let originalTitle4 = movieApiData[3][1];
          let originalTitle5 = movieApiData[4][1];

          let moviePoster1 = movieApiData[0][0];
          let moviePoster2 = movieApiData[1][0];
          let moviePoster3 = movieApiData[2][0];
          let moviePoster4 = movieApiData[3][0];
          let moviePoster5 = movieApiData[4][0];

          let title1 =
            originalTitle1.length > 15
              ? originalTitle1.substring(0, 15) + "..."
              : originalTitle1;

          let title2 =
            originalTitle2.length > 15
              ? originalTitle2.substring(0, 15) + "..."
              : originalTitle2;

          let title3 =
            originalTitle3.length > 15
              ? originalTitle3.substring(0, 15) + "..."
              : originalTitle3;

          let title4 =
            originalTitle4.length > 15
              ? originalTitle4.substring(0, 15) + "..."
              : originalTitle4;

          let title5 =
            originalTitle5.length > 15
              ? originalTitle5.substring(0, 15) + "..."
              : originalTitle5;

          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Random Movies</div>
  <div id="listings">
    <div class="listing" id="one">
      <div class="poster">
      <img src="${movieApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${title1}</div>
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
      <div class="title" id="twoTitle">${title2}</div>
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
      <div class="title" id="threeTitle">${title3}</div>
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
      <div class="title" id="fourTitle">${title4}</div>
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
      <div class="title" id="fiveTitle">${title5}</div>
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
              //let productTitle = titleID.textContent;
              let productTitle;
              switch (productID) {
                case "oneTitle":
                  productTitle = originalTitle1;
                  productPoster = moviePoster1;
                  break;
                case "twoTitle":
                  productTitle = originalTitle2;
                  productPoster = moviePoster2;
                  break;
                case "threeTitle":
                  productTitle = originalTitle3;
                  productPoster = moviePoster3;
                  break;
                case "fourTitle":
                  productTitle = originalTitle4;
                  productPoster = moviePoster4;
                  break;
                case "fiveTitle":
                  productTitle = originalTitle5;
                  productPoster = moviePoster5;
                  break;
                default:
                  console.error(
                    "Unexpected ID for watchlist button:",
                    productID
                  );
                  return;
              }

              let productInfo = {
                type: "movies",
                title: productTitle,
                userId: userId,
                poster: productPoster,
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
      "The Bourne Identity",
      "Patriot Games",
      "Kill Decision",
      "Scarecrow",
      "The Hunt for Red October",
      "The Lions of Lucerne",
      "Term Limits",
      "I Am Pilgrim",
      "Transfer of Power",
      "Without Remorse",
    ],
    adventure: [
      "The Adventures of Huckleberry Finn",
      "Treasure Island",
      "The Call of the Wild",
      "Journey to the Center of the Earth",
      "Around the World in Eighty Days",
      "Life of Pi",
      "Into the Wild",
      "The Lost City of Z",
      "Moby-Dick",
      "King Solomon's Mines",
    ],
    animation: [
      "Alice's Adventures in Wonderland",
      "Coraline",
      "The Jungle Book",
      "The Invention of Hugo Cabret",
      "The Little Prince",
      "Matilda",
      "Charlotte's Web",
      "Winnie-the-Pooh",
      "Howl's Moving Castle",
      "Fantastic Mr. Fox",
    ],
    biography: [
      "Steve Jobs",
      "Becoming",
      "Alexander Hamilton",
      "The Diary of a Young Girl",
      "Einstein: His Life and Universe",
      "The Wright Brothers",
      "Long Walk to Freedom",
      "Educated",
      "When Breath Becomes Air",
      "I Know Why the Caged Bird Sings",
    ],
    comedy: [
      "Good Omens",
      "Catch-22",
      "The Hitchhiker's Guide to the Galaxy",
      "Bossypants",
      "Bridget Jones's Diary",
      "Me Talk Pretty One Day",
      "The Importance of Being Earnest",
      "Yes Please",
      "The Princess Bride",
      "Where'd You Go, Bernadette",
    ],
    crime: [
      "The Girl with the Dragon Tattoo",
      "Gone Girl",
      "Big Little Lies",
      "The Silence of the Lambs",
      "In the Woods",
      "The Godfather",
      "The Big Sleep",
      "The Maltese Falcon",
      "Sharp Objects",
      "I Am Watching You",
    ],
    documentary: [
      "Sapiens",
      "Into Thin Air",
      "The Immortal Life of Henrietta Lacks",
      "Educated",
      "The Devil in the White City",
      "Unbroken",
      "The Sixth Extinction",
      "Fast Food Nation",
      "Hiroshima",
      "A Brief History of Time",
    ],
    drama: [
      "To Kill a Mockingbird",
      "Pride and Prejudice",
      "The Great Gatsby",
      "The Catcher in the Rye",
      "Jane Eyre",
      "The Road",
      "The Book Thief",
      "Wuthering Heights",
      "A Thousand Splendid Suns",
      "The Kite Runner",
    ],
    family: [
      "Charlotte's Web",
      "Harry Potter and the Sorcerer's Stone",
      "Matilda",
      "The Secret Garden",
      "Little Women",
      "The Wind in the Willows",
      "The Lion, the Witch and the Wardrobe",
      "Anne of Green Gables",
      "The BFG",
      "Wonder",
    ],
    fantasy: [
      "The Hobbit",
      "Harry Potter and the Goblet of Fire",
      "The Name of the Wind",
      "A Game of Thrones",
      "The Way of Kings",
      "American Gods",
      "The Golden Compass",
      "Good Omens",
      "The Lies of Locke Lamora",
      "Mistborn",
    ],
    noir: [
      "The Big Sleep",
      "The Maltese Falcon",
      "Farewell, My Lovely",
      "In a Lonely Place",
      "The Postman Always Rings Twice",
      "Double Indemnity",
      "L.A. Confidential",
      "Sin City",
      "The Black Dahlia",
      "Murder on the Orient Express",
    ],
    history: [
      "Team of Rivals",
      "The Guns of August",
      "The Wright Brothers",
      "1776",
      "The Diary of a Young Girl",
      "The Rise and Fall of the Third Reich",
      "Alexander Hamilton",
      "The Devil in the White City",
      "The Immortal Life of Henrietta Lacks",
      "John Adams",
    ],
    horror: [
      "The Shining",
      "Dracula",
      "Frankenstein",
      "Bird Box",
      "The Exorcist",
      "House of Leaves",
      "The Haunting of Hill House",
      "Hell House",
      "The Silence of the Lambs",
      "The Amityville Horror",
    ],
    music: [
      "Just Kids",
      "Chronicles",
      "Scar Tissue",
      "Life",
      "The Dirt",
      "Cash",
      "Born to Run",
      "Wildflower",
      "Girl in a Band",
      "Unknown Pleasures",
    ],
    musical: [
      "West Side Story",
      "The Phantom of the Opera",
      "Wicked",
      "Les Misérables",
      "Hamilton: The Revolution",
      "Sweeney Todd",
      "Jesus Christ Superstar",
      "Rent",
      "Chicago",
      "Cabaret",
    ],
    mystery: [
      "Gone Girl",
      "The Girl with the Dragon Tattoo",
      "Big Little Lies",
      "Sharp Objects",
      "In the Woods",
      "Murder on the Orient Express",
      "And Then There Were None",
      "The Da Vinci Code",
      "Rebecca",
      "The Silent Patient",
    ],
    romance: [
      "Pride and Prejudice",
      "The Notebook",
      "Outlander",
      "Me Before You",
      "Twilight",
      "The Time Traveler's Wife",
      "Jane Eyre",
      "Atonement",
      "Normal People",
      "The Hating Game",
    ],
    scifi: [
      "Dune",
      "Neuromancer",
      "Ender's Game",
      "Snow Crash",
      "The Left Hand of Darkness",
      "Hyperion",
      "The War of the Worlds",
      "Foundation",
      "The Expanse",
      "The Three-Body Problem",
    ],
    short: [
      "Interpreter of Maladies",
      "Nine Stories",
      "Dubliners",
      "Stories of Your Life and Others",
      "The Lottery",
      "Tenth of December",
      "Will You Please Be Quiet, Please?",
      "What We Talk About When We Talk About Love",
      "Her Body and Other Parties",
      "The Thing Around Your Neck",
    ],
    sport: [
      "Moneyball",
      "Friday Night Lights",
      "The Boys in the Boat",
      "Open",
      "Seabiscuit",
      "The Blind Side",
      "A Life Well Played",
      "Unbroken",
      "Shoe Dog",
      "Running with the Buffaloes",
    ],
    superhero: [
      "Watchmen",
      "The Dark Knight Returns",
      "V for Vendetta",
      "Batman: Year One",
      "All-Star Superman",
      "Kingdom Come",
      "The Killing Joke",
      "Civil War",
      "Old Man Logan",
      "Spider-Man: Blue",
    ],
    thriller: [
      "The Girl on the Train",
      "Gone Girl",
      "The Girl with the Dragon Tattoo",
      "Sharp Objects",
      "Before I Go to Sleep",
      "The Silent Patient",
      "Big Little Lies",
      "In the Woods",
      "Dark Places",
      "Behind Closed Doors",
    ],
    war: [
      "All Quiet on the Western Front",
      "The Things They Carried",
      "Catch-22",
      "Slaughterhouse-Five",
      "Band of Brothers",
      "The Naked and the Dead",
      "The Yellow Birds",
      "The Red Badge of Courage",
      "Black Hawk Down",
      "Matterhorn",
    ],
    western: [
      "Lonesome Dove",
      "True Grit",
      "Blood Meridian",
      "The Big Sky",
      "Riders of the Purple Sage",
      "Shane",
      "The Sisters Brothers",
      "The Virginian",
      "Doc",
      "The Assassination of Jesse James",
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
          let alreadySelected = [];

          for (let i = 0; i < 5; i++) {
            //console.log(genreList[randomGenre]);
            let books = genreList[randomGenre];
            let randomInt = Math.floor(Math.random() * 10);

            while (alreadySelected.includes(randomInt)) {
              randomInt = Math.floor(Math.random() * 10);
            }

            alreadySelected.push(randomInt);

            let title = books[randomInt];

            //console.log(title);

            try {
              let response = await fetch(
                `/groupSearchBook?title=${encodeURIComponent(title)}`
              );
              if (!response.ok) throw new Error("Book not found");

              let data = await response.json();
              let avgRating = data.rating;
              if (avgRating === undefined) {
                avgRating = "N/A ";
              }
              let info = [data.poster, data.title, data.authors, avgRating];
              bookApiData.push(info);
            } catch (error) {
              searchResult.innerText = "Book not found or an error occurred.";
              console.error("Error fetching book:", error);
            }

            selectedBooks.push(books[randomInt]);
          }

          //console.log(bookApiData);

          let catalog = document.getElementById("catalog");

          let originalTitle1 = bookApiData[0][1];
          let originalTitle2 = bookApiData[1][1];
          let originalTitle3 = bookApiData[2][1];
          let originalTitle4 = bookApiData[3][1];
          let originalTitle5 = bookApiData[4][1];

          let bookPoster1 = bookApiData[0][0];
          let bookPoster2 = bookApiData[1][0];
          let bookPoster3 = bookApiData[2][0];
          let bookPoster4 = bookApiData[3][0];
          let bookPoster5 = bookApiData[4][0];

          let title1 =
            originalTitle1.length > 15
              ? originalTitle1.substring(0, 15) + "..."
              : originalTitle1;

          let title2 =
            originalTitle2.length > 15
              ? originalTitle2.substring(0, 15) + "..."
              : originalTitle2;

          let title3 =
            originalTitle3.length > 15
              ? originalTitle3.substring(0, 15) + "..."
              : originalTitle3;

          let title4 =
            originalTitle4.length > 15
              ? originalTitle4.substring(0, 15) + "..."
              : originalTitle4;

          let title5 =
            originalTitle5.length > 15
              ? originalTitle5.substring(0, 15) + "..."
              : originalTitle5;

          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Books by Preferences</div>
  <div id="listings">
    <div class="listing" id="1">
      <div class="poster">
      <img src="${bookApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${title1}</div>
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
      <div class="title" id="twoTitle">${title2}</div>
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
      <div class="title" id="threeTitle">${title3}</div>
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
      <div class="title" id="fourTitle">${title4}</div>
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
      <div class="title" id="fiveTitle">${title5}</div>
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
              //let productTitle = titleID.textContent;
              let productTitle;
              switch (productID) {
                case "oneTitle":
                  productTitle = originalTitle1;
                  productPoster = bookPoster1;
                  break;
                case "twoTitle":
                  productTitle = originalTitle2;
                  productPoster = bookPoster2;
                  break;
                case "threeTitle":
                  productTitle = originalTitle3;
                  productPoster = bookPoster3;
                  break;
                case "fourTitle":
                  productTitle = originalTitle4;
                  productPoster = bookPoster4;
                  break;
                case "fiveTitle":
                  productTitle = originalTitle5;
                  productPoster = bookPoster5;
                  break;
                default:
                  console.error(
                    "Unexpected ID for watchlist button:",
                    productID
                  );
                  return;
              }

              let productInfo = {
                type: "books",
                title: productTitle,
                userId: userId,
                poster: productPoster,
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
          let alreadySelected = [];

          for (let i = 0; i < outputGenres.length; i++) {
            let genre = outputGenres[i];
            let books = genreList[genre];
            let randomInt = Math.floor(Math.random() * 10);

            while (alreadySelected.includes(randomInt)) {
              randomInt = Math.floor(Math.random() * 10);
            }

            alreadySelected.push(randomInt);

            let title = books[randomInt];

            //console.log(title);

            try {
              let response = await fetch(
                `/groupSearchBook?title=${encodeURIComponent(title)}`
              );
              if (!response.ok) throw new Error("Book not found");

              let data = await response.json();
              let avgRating = data.rating;
              if (avgRating === undefined) {
                avgRating = "N/A ";
              }
              let info = [data.poster, data.title, data.authors, avgRating];
              bookApiData.push(info);
            } catch (error) {
              searchResult.innerText = "Book not found or an error occurred.";
              console.error("Error fetching book:", error);
            }

            selectedBooks.push(movies[randomInt]);
          }

          //console.log(bookApiData);

          let catalog = document.getElementById("catalog");
          let originalTitle1 = bookApiData[0][1];
          let originalTitle2 = bookApiData[1][1];
          let originalTitle3 = bookApiData[2][1];
          let originalTitle4 = bookApiData[3][1];
          let originalTitle5 = bookApiData[4][1];

          let bookPoster1 = bookApiData[0][0];
          let bookPoster2 = bookApiData[1][0];
          let bookPoster3 = bookApiData[2][0];
          let bookPoster4 = bookApiData[3][0];
          let bookPoster5 = bookApiData[4][0];

          let title1 =
            originalTitle1.length > 15
              ? originalTitle1.substring(0, 15) + "..."
              : originalTitle1;

          let title2 =
            originalTitle2.length > 15
              ? originalTitle2.substring(0, 15) + "..."
              : originalTitle2;

          let title3 =
            originalTitle3.length > 15
              ? originalTitle3.substring(0, 15) + "..."
              : originalTitle3;

          let title4 =
            originalTitle4.length > 15
              ? originalTitle4.substring(0, 15) + "..."
              : originalTitle4;

          let title5 =
            originalTitle5.length > 15
              ? originalTitle5.substring(0, 15) + "..."
              : originalTitle5;

          catalog.innerHTML = `
<div id="catalogBlock">
  <div id="listingTitle">Random Books</div>
  <div id="listings">
    <div class="listing" id="1">
      <div class="poster">
      <img src="${bookApiData[0][0]}"/>
      </div>
      <div class="title" id="oneTitle">${title1}</div>
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
      <div class="title" id="twoTitle">${title2}</div>
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
      <div class="title" id="threeTitle">${title3}</div>
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
      <div class="title" id="fourTitle">${title4}</div>
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
      <div class="title" id="fiveTitle">${title5}</div>
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
              //let productTitle = titleID.textContent;
              switch (productID) {
                case "oneTitle":
                  productTitle = originalTitle1;
                  productPoster = bookPoster1;
                  break;
                case "twoTitle":
                  productTitle = originalTitle2;
                  productPoster = bookPoster2;
                  break;
                case "threeTitle":
                  productTitle = originalTitle3;
                  productPoster = bookPoster3;
                  break;
                case "fourTitle":
                  productTitle = originalTitle4;
                  productPoster = bookPoster4;
                  break;
                case "fiveTitle":
                  productTitle = originalTitle5;
                  productPoster = bookPoster5;
                  break;
                default:
                  console.error(
                    "Unexpected ID for watchlist button:",
                    productID
                  );
                  return;
              }

              let productInfo = {
                type: "books",
                title: productTitle,
                userId: userId,
                poster: productPoster,
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
  searchResult.innerHTML = ``;
  document.getElementById("search").value = ``;
  moviesButton.classList.remove("typeClicked");
  booksButton.classList.add("typeClicked");
  localStorage.setItem("type", "books");
  populateCatalogBooks();
});

moviesButton.addEventListener("click", () => {
  searchResult.innerHTML = ``;
  document.getElementById("search").value = ``;
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
