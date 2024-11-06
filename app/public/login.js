// document.onLoad() -- check for cookies, if exists, then you can redirect straight to index.html
// conversely need to do logout feature on index.html which will remove that cookie!!!
// send a request to add the token to storageee/../.? wait but then how we gon access it consistently if its random liek,
// then don't have it be random, consilt what original said 
// yeah so token, because we gonna have ot store in db, it can't be rrandom and instead has to be a specific hash or something

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
        console.log(data);
        if(data.status === "success") {
            status.textContent = data.message;
            status.style.color = "green";
            // go to devtools -> application tab -> storage on left-hand side and then dropdown for cookies
            // window.location.href = "index.html";
        }else{
            status.textContent = data.message;
            status.style.color = "red";
        }

    })
    .catch(error => console.log(error))

})


signUpButton.addEventListener("click", () => {
    window.location.href = "signUp.html"
})
