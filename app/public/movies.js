async function code() {
    let code = prompt("Please enter a group code:");
  
    if (!code || code.trim() === '') {
      alert("Invalid");
      return;
    }
  
    try {
      let response = await fetch(`/codeValid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
  
      let result = await response.json();
      if (result.isValid) {
        alert("Valid ");
        return code;
      } 
      else {
        alert("Code already exists. Please try a different one.");
        return code(); 
      }
    } catch (error) {
      alert("Please try again.");
    }
  }
  

let createButton = document.getElementById("create");
createButton.addEventListener("click", async () => {
    let groupCode = await code(); 

    if (!groupCode) return;

    let leaderId = localStorage.getItem('userId');
    if (!leaderId) {
        alert("Error: You must be logged in to create a group.");
        return;
    }

    let privacy = prompt("Should the group be public or private?");
    if (privacy !== 'public' && privacy !== 'private') {
        alert("Invalid input. Please enter 'public' or 'private'.");
        return;
    }

    fetch(`/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupCode, leaderId, privacy })
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to create group');
        }
        return response.json();
    })
    .then((data) => {
        window.location.href = `/group/${groupCode}`;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

let chooseButton = document.getElementById("choose");
chooseButton.addEventListener("click", () => {
    let groupCodeInput = document.getElementById("groupCodeInput");
    let submitGroupCodeButton = document.getElementById("submitGroupCode");

    groupCodeInput.style.display = 'block';
    submitGroupCodeButton.style.display = 'block';

    submitGroupCodeButton.addEventListener("click", () => {
        let groupCode = groupCodeInput.value.trim();

        if (!groupCode) {
            alert("Please enter a valid group code.");
            return;
        }

        window.location.href = `/group/${groupCode}`;
    });
});
