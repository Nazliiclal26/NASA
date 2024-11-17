let usernameInput = document.getElementById("newUsername");
let passInput = document.getElementById("newPass");
let repeatPassInput = document.getElementById("repeatPass");
let homeButton = document.getElementById("home");
let confirmPassButton = document.getElementById("confirm");
let confirmUserButton = document.getElementById("confirmUser");
let profileButton = document.getElementById("profile");
let genresButton = document.getElementById("genres");
let settingsBlock = document.getElementById("settingsBlock");
let genresBox = document.getElementById("genresBox");
let profileBlock = document.getElementById("profileBlock");
let submitGenres = document.getElementById("submit");
let logoutButton = document.getElementById("logout");

homeButton.addEventListener("click", () => {
  window.location.href = "/selection.html";
});

logoutButton.addEventListener("click", () => {
  localStorage.clear("userId");
  fetch('/clearCookie').then((response) => {
    return response.json();
  }).then((body) => {
    window.location.href = "/";
    console.log(body.message);
  }).catch((error) => {
    console.error(error);
  });
});

confirmUserButton.addEventListener("click", () => {
  let username = usernameInput.value.trim();
  let userId = localStorage.getItem("userId");

  if (username === "") {
    alert("missing input");
  } else {
    alert("good input");

    let newUserInfo = {
      username: username,
      userId: localStorage.getItem("userId"),
    };

    try {
      fetch(`/changeUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserInfo),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert(data.message);
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

confirmPassButton.addEventListener("click", () => {
  let password = passInput.value.trim();
  let repeatPass = repeatPassInput.value.trim();
  let userId = localStorage.getItem("userId");

  if (repeatPass === "" || password === "") {
    alert("missing input");
  } else if (repeatPass !== password) {
    alert("passwords dont match");
  } else {
    alert("good input");

    let newUserInfo = {
      password: password,
      userId: userId,
    };

    try {
      fetch(`/changePass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUserInfo),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert(data.message);
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

let selectedGenres = [];

async function handleSubmitGenres() {
  let userId = localStorage.getItem("userId");

  if (selectedGenres.length === 0) {
    let selectedGenres = [];

    fetch("/signUpPrompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: userId,
        genres: selectedGenres,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("changed");
        } else {
          console.log(data);
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
    return;
  }

  fetch("/signUpPrompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: userId,
      genres: selectedGenres,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert("changed");
      } else {
        console.log(data);
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

genresButton.addEventListener("click", () => {
  profileButton.classList.remove("actionClicked");
  genresButton.classList.add("actionClicked");

  settingsBlock.style.backgroundColor = "white";

  settingsBlock.innerHTML = `
  <div id="mainBox">
      <div id="title">What Genres Do You Like?</div>
      <div id="content">
        <div class="row">
          <div class="button" id="action">Action</div>
          <div class="button" id="adventure">Adventure</div>
          <div class="button" id="animation">Animation</div>
          <div class="button" id="biography">Biography</div>
        </div>
        <div class="row">
          <div class="button" id="comedy">Comedy</div>
          <div class="button" id="crime">Crime</div>
          <div class="button" id="documentary">Documentary</div>
          <div class="button" id="drama">Drama</div>
        </div>
        <div class="row">
          <div class="button" id="family">Family</div>
          <div class="button" id="fantasy">Fantasy</div>
          <div class="button" id="noir">Film Noir</div>
          <div class="button" id="history">History</div>
        </div>
        <div class="row">
          <div class="button" id="horror">Horror</div>
          <div class="button" id="music">Music</div>
          <div class="button" id="musical">Musical</div>
          <div class="button" id="mystery">Mystery</div>
        </div>
        <div class="row">
          <div class="button" id="romance">Romance</div>
          <div class="button" id="scifi">Sci-Fi</div>
          <div class="button" id="short">Short</div>
          <div class="button" id="sport">Sport</div>
        </div>
        <div class="row">
          <div class="button" id="superhero">Superhero</div>
          <div class="button" id="thriller">Thriller</div>
          <div class="button" id="war">War</div>
          <div class="button" id="western">Western</div>
        </div>
      </div>
      <div id="actions">
        <div id="submit">Submit</div>
      </div>
  `;
  let submitGenres = document.getElementById("submit");
  submitGenres.addEventListener("click", handleSubmitGenres);
  let buttons = document.querySelectorAll(".button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      let genre = button.id;
      button.classList.toggle("clicked");

      if (selectedGenres.includes(genre)) {
        selectedGenres = selectedGenres.filter((each) => each !== genre);
      } else {
        selectedGenres.push(genre);
      }
    });
  });
});

profileButton.addEventListener("click", () => {
  genresButton.classList.remove("actionClicked");
  profileButton.classList.add("actionClicked");

  settingsBlock.style.backgroundColor = "rgb(202, 238, 251)";
  settingsBlock.innerHTML = `
   <div id="profileBlock">
          <div class="paramBlock" id="username">
            <div class="title">Username</div>
            <div class="titleInput">
              <input
                type="text"
                id="newUsername"
                name="newUsername"
                placeholder="Enter new username"
              />
            </div>
          </div>
          <div id="confirmUser">Change Username</div>
          <div class="paramBlock" id="password">
            <div class="title">Password</div>
            <div class="titleInput">
              <input
                type="text"
                id="newPass"
                name="newPass"
                placeholder="Enter new password"
              />
            </div>
            <div class="title">Repeat Password</div>
            <div class="titleInput">
              <input
                type="text"
                id="repeatPass"
                name="repeatPass"
                placeholder="Enter password again"
              />
            </div>
          </div>
          <div id="confirm">Change Password</div>
        </div>
  `;
});

profileButton.classList.add("actionClicked");
