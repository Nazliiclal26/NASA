let usernameInput = document.getElementById("newUsername");
let passInput = document.getElementById("newPass");
let repeatPassInput = document.getElementById("repeatPass");
let homeButton = document.getElementById("home");
let confirmPassButton = document.getElementById("confirm");
let confirmUserButton = document.getElementById("confirmUser");

homeButton.addEventListener("click", () => {
  window.location.href = "/selection.html";
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
