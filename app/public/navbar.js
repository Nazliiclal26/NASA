let accountButton = document.getElementById("account");
let logoutButton = document.getElementById("logout");
let homeButton = document.getElementById("home");

homeButton.addEventListener("click", () => {
  window.location.href = "/selection.html";
});

logoutButton.addEventListener("click", () => {
  localStorage.clear("userId");
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

document.getElementById("watchlistLink").addEventListener("click", () => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    window.location.href = "watchlist.html";
  } else {
    alert("User not logged in.");
  }
});

accountButton.addEventListener("click", () => {
  window.location.href = "/account.html";
});
