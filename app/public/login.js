document.addEventListener("DOMContentLoaded", checkCookie);

function checkCookie () {
  fetch('/checkCookie').then((response) => {
    if (response.ok) {
      return response.json().then((body) => {
        if (body.cookieExists) {
          localStorage.setItem("userId", body.userId);
          window.location.href = "/selection.html";
        }
      });
    }
  }).catch((error) => {
    console.error(error);
  });
}

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
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            status.textContent = data.message;
            status.style.color = "green";
        }else{
            status.textContent = data.message;
            status.style.color = "red";
        }

        // make call to store authorization token
    })
    .catch(error => console.log(error))

});

// cookie storage function

signUpButton.addEventListener("click", () => {
  window.location.href = "/signUp.html";
});
