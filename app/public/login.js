let loginButton = document.getElementById("login");
let signUpButton = document.getElementById("signUp");

loginButton.addEventListener("click", () => {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        localStorage.setItem("userId", data.userId);
        alert(data.message);
        window.location.href = "/selection.html";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
});

signUpButton.addEventListener("click", () => {
  window.location.href = "/signUp.html";
});
