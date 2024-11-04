let signUpButton = document.getElementById("signUp");
let signInButton = document.getElementById("signIn");

signUpButton.addEventListener("click", () => {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let repeatPass = document.getElementById("repeatPass").value;
    let status = document.getElementById("status");

    status.textContent = "";

    let credentials = {"firstName" : firstName,
                        "lastName" : lastName, 
                        "username" : username, 
                        "password" : password,
                        "repeatPass" : repeatPass};

    fetch("/signUp", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === "error") {
            status.textContent = data.message;
            status.style.color = "red";
        }else{
            status.textContent = data.message;
            status.style.color = "green";
        }
    })
    .catch(error => console.log(error))

});

signInButton.addEventListener("click", () => {
    window.location.href = "login.html"
});
