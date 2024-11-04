let loginButton = document.getElementById("login");
let signUpButton = document.getElementById("signUp");

loginButton.addEventListener("click", () => {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let status = document.getElementById("status");

    status.textContent = "";

    let credentials = {"username" : username, "password" : password};

    fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
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

})

// cookie storage function

signUpButton.addEventListener("click", () => {
    window.location.href = "signUp.html"
})
