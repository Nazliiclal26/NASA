function code(){
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        let rand = Math.floor(Math.random() * chars.length);
        code += chars.charAt(rand);
    }
    return code;
}

let button = document.getElementById("create");
button.addEventListener("click", () => {
    let groupCode = code();  
    fetch(`/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupCode: groupCode })
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
    document.getElementById("choose-box").style.display="block";
});
let joinButton = document.getElementById("joinButton");
joinButton.addEventListener("click", () => {
    let groupCode = document.getElementById("groupInput").value;
    if (groupCode === '') {
        return;
    }
    window.location.href = `/group/${groupCode}`;
});