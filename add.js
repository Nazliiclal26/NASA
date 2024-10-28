/*
ADD YOUR CLIENT-SIDE CODE FOR add.html HERE

*/

let button = document.getElementById("submit");
button.addEventListener("click", () => {
  let title = document.getElementById("title").value;
  let genre = document.getElementById("genre").value;
  let quality2 = document.querySelector('input[name="quality"]:checked');
  let quality = null;
  if (quality2 !== null) {
    quality = quality2.value;
  }
  //let message = document.getElementById("message");

  fetch(`/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, genre, quality }),
  }).then((response) => {
    let message = document.getElementById("message");
    message.textContent = "";
    if (response.status === 200){
        message.textContent = "Success";
    } 
    
    else{
        message.textContent = "Bad request";
    }
    })
    .catch((error) => {
      console.error(error);
    });
});