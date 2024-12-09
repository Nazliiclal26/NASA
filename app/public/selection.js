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

let mainGenres = [
  { id: 28, name: "action" },
  { id: 12, name: "adventure" },
  { id: 16, name: "animation" },
  { id: 35, name: "comedy" },
  { id: 80, name: "crime" },
  { id: 99, name: "documentary" },
  { id: 18, name: "drama" },
  { id: 10751, name: "family" },
  { id: 14, name: "fantasy" },
  { id: 36, name: "history" },
  { id: 27, name: "horror" },
  { id: 10402, name: "music" },
  { id: 9648, name: "mystery" },
  { id: 10749, name: "romance" },
  { id: 53, name: "thriller" },
  { id: 10752, name: "war" },
  { id: 37, name: "western" },
];

document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem("groupInfo");
  localStorage.removeItem("leaderUsername");
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

            let groupCode = data.group.group_name;

            localStorage.setItem("isNewUser", "true");
            if (type === "book") {
              window.location.href = `/bookGroup/${groupCode}`;
            } else {
              window.location.href = `/movieGroup/${groupCode}`;
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
            let groupCode = data.group.group_name;
            if (type === "book") {
              window.location.href = `/bookGroup/${groupCode}`;
            } else {
              window.location.href = `/movieGroup/${groupCode}`;
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

function getNames(ids) {
  let item = mainGenres
    .filter((genre) => ids.includes(genre.id))
    .map((genre) => genre.name.charAt(0).toUpperCase() + genre.name.slice(1))
    .join(", ");

  return item;
}

async function populateCatalog() {
  let userId = localStorage.getItem("userId");

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

        // console.log(genres);

        if (numGenres > 0) {
          let randomNum = Math.floor(Math.random() * numGenres);
          let randomGenre = genres[randomNum];

          console.log(randomGenre);
          let apiObject = mainGenres.find(
            (g) => g.name.toLowerCase() === randomGenre
          );

          let apiID = apiObject.id;

          console.log(apiID);

          let movieApiData = [];

          try {
            let response = await fetch(`/catalogSearchNewApi?id=${apiID}`);
            let apiData = await response.json();
            //console.log(apiData);

            for (let each of apiData) {
              let { title, poster_path, vote_average, genre_ids, overview } =
                each;

              let newObject = {
                title,
                poster_path,
                vote_average,
                genre_ids,
              };

              console.log(newObject);

              movieApiData.push(newObject);
            }

            if (!response.ok) throw new Error("Film not found");
          } catch (error) {
            searchResult.innerText = "Film not found or an error occurred.";
            console.error("Error fetching film:", error);
          }

          console.log(movieApiData);

          // for (let i = 0; i < 5; i++) {
          //   //console.log(genreList[randomGenre]);
          //   let movies = genreList[randomGenre];
          //   let randomInt = Math.floor(Math.random() * 10);

          //   while (alreadySelected.includes(randomInt)) {
          //     randomInt = Math.floor(Math.random() * 10);
          //   }

          //   alreadySelected.push(randomInt);

          //   let title = movies[randomInt];

          //   //console.log(title);

          //   try {
          //     let response = await fetch(
          //       `/groupSearch?title=${encodeURIComponent(title)}`
          //     );
          //     if (!response.ok) throw new Error("Film not found");

          //     let data = await response.json();
          //     let info = [data.poster, data.title, data.genre, data.rating];
          //     movieApiData.push(info);
          //   } catch (error) {
          //     searchResult.innerText = "Film not found or an error occurred.";
          //     console.error("Error fetching film:", error);
          //   }

          //   selectedMovies.push(movies[randomInt]);
          // }

          //console.log(movieApiData);

          let catalog = document.getElementById("catalog");

          let originalTitle1 = movieApiData[0].title;
          let originalTitle2 = movieApiData[1].title;
          let originalTitle3 = movieApiData[2].title;
          let originalTitle4 = movieApiData[3].title;
          let originalTitle5 = movieApiData[4].title;

          let moviePoster1 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[0].poster_path;
          let moviePoster2 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[1].poster_path;
          let moviePoster3 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[2].poster_path;
          let moviePoster4 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[3].poster_path;
          let moviePoster5 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[4].poster_path;

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
      <img src="${moviePoster1}"/>
      </div>
      <div class="title" id="oneTitle">${title1}</div>
      <div class="miniTitle">${getNames(movieApiData[0].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[0].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="oneTitle">+</div>
      </div>
    </div>
    <div class="listing" id="two">
      <div class="poster">
      <img src="${moviePoster2}"/>
      </div>
      <div class="title" id="twoTitle">${title2}</div>
      <div class="miniTitle">${getNames(movieApiData[1].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[1].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="twoTitle">+</div>
      </div>
    </div>
    <div class="listing" id="three">
      <div class="poster">
      <img src="${moviePoster3}"/>
      </div>
      <div class="title" id="threeTitle">${title3}</div>
      <div class="miniTitle">${getNames(movieApiData[2].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[2].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="threeTitle">+</div>
      </div>
    </div>
    <div class="listing" id="four">
      <div class="poster">
      <img src="${moviePoster4}"/>
      </div>
      <div class="title" id="fourTitle">${title4}</div>
      <div class="miniTitle">${getNames(movieApiData[3].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[3].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="fourTitle">+</div>
      </div>
    </div>
    <div class="listing" id="five">
      <div class="poster">
      <img src="${moviePoster5}"/>
      </div>
      <div class="title" id="fiveTitle">${title5}</div>
      <div class="miniTitle">${getNames(movieApiData[4].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[4].vote_average * 10) / 10
        }</div>
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
          let randomNum = Math.floor(Math.random() * 17);
          let randomGenre = mainGenres[randomNum].name;

          console.log(randomGenre);

          // console.log(randomGenre);
          let apiObject = mainGenres.find(
            (g) => g.name.toLowerCase() === randomGenre
          );

          let apiID = apiObject.id;

          console.log(apiID);

          let movieApiData = [];

          try {
            let response = await fetch(`/catalogSearchNewApi?id=${apiID}`);
            let apiData = await response.json();
            //console.log(apiData);

            for (let each of apiData) {
              let { title, poster_path, vote_average, genre_ids, overview } =
                each;

              let newObject = {
                title,
                poster_path,
                vote_average,
                genre_ids,
              };

              console.log(newObject);

              movieApiData.push(newObject);
            }

            if (!response.ok) throw new Error("Film not found");
          } catch (error) {
            searchResult.innerText = "Film not found or an error occurred.";
            console.error("Error fetching film:", error);
          }

          console.log(movieApiData);

          // for (let i = 0; i < 5; i++) {
          //   //console.log(genreList[randomGenre]);
          //   let movies = genreList[randomGenre];
          //   let randomInt = Math.floor(Math.random() * 10);

          //   while (alreadySelected.includes(randomInt)) {
          //     randomInt = Math.floor(Math.random() * 10);
          //   }

          //   alreadySelected.push(randomInt);

          //   let title = movies[randomInt];

          //   //console.log(title);

          //   try {
          //     let response = await fetch(
          //       `/groupSearch?title=${encodeURIComponent(title)}`
          //     );
          //     if (!response.ok) throw new Error("Film not found");

          //     let data = await response.json();
          //     let info = [data.poster, data.title, data.genre, data.rating];
          //     movieApiData.push(info);
          //   } catch (error) {
          //     searchResult.innerText = "Film not found or an error occurred.";
          //     console.error("Error fetching film:", error);
          //   }

          //   selectedMovies.push(movies[randomInt]);
          // }

          //console.log(movieApiData);

          let catalog = document.getElementById("catalog");

          let originalTitle1 = movieApiData[0].title;
          let originalTitle2 = movieApiData[1].title;
          let originalTitle3 = movieApiData[2].title;
          let originalTitle4 = movieApiData[3].title;
          let originalTitle5 = movieApiData[4].title;

          let moviePoster1 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[0].poster_path;
          let moviePoster2 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[1].poster_path;
          let moviePoster3 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[2].poster_path;
          let moviePoster4 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[3].poster_path;
          let moviePoster5 =
            "https://image.tmdb.org/t/p/original/" +
            movieApiData[4].poster_path;

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
      <img src="${moviePoster1}"/>
      </div>
      <div class="title" id="oneTitle">${title1}</div>
      <div class="miniTitle">${getNames(movieApiData[0].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[0].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="oneTitle">+</div>
      </div>
    </div>
    <div class="listing" id="two">
      <div class="poster">
      <img src="${moviePoster2}"/>
      </div>
      <div class="title" id="twoTitle">${title2}</div>
      <div class="miniTitle">${getNames(movieApiData[1].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[1].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="twoTitle">+</div>
      </div>
    </div>
    <div class="listing" id="three">
      <div class="poster">
      <img src="${moviePoster3}"/>
      </div>
      <div class="title" id="threeTitle">${title3}</div>
      <div class="miniTitle">${getNames(movieApiData[2].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[2].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="threeTitle">+</div>
      </div>
    </div>
    <div class="listing" id="four">
      <div class="poster">
      <img src="${moviePoster4}"/>
      </div>
      <div class="title" id="fourTitle">${title4}</div>
      <div class="miniTitle">${getNames(movieApiData[3].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[3].vote_average * 10) / 10
        }</div>
        <div class="watchlistButton" id="fourTitle">+</div>
      </div>
    </div>
    <div class="listing" id="five">
      <div class="poster">
      <img src="${moviePoster5}"/>
      </div>
      <div class="title" id="fiveTitle">${title5}</div>
      <div class="miniTitle">${getNames(movieApiData[4].genre_ids)}</div>
      <div class="subBlock">
        <div class="rating">${
          Math.round(movieApiData[4].vote_average * 10) / 10
        }</div>
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
