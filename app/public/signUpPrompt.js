let buttons = document.querySelectorAll(".button");
let submitButton = document.getElementById("submit");
let mainBox = document.getElementById("mainBox");
let selectedGenres = [];

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    let genre = button.id;
    button.classList.toggle("clicked");

    if (selectedGenres.includes(genre)) {
      selectedGenres = selectedGenres.filter((each) => each !== genre);
    } else {
      selectedGenres.push(genre);
    }
  });
});

async function submitGenres() {
  let userId = localStorage.getItem("userID");

  if (selectedGenres.length === 0) {
    alert("Select at least one genre.");
    return;
  }

  fetch("/signUpPrompt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID: userId,
      genres: selectedGenres,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        mainBox.innerHTML = `
        <div id="innerGroup">
        <div class="titleGroup" id="title">Join or Create Group?</div>
        <div class="mainButton" id="join">Join</div>
        <div class="mainButton" id="create">Create</div>
        <div id="skip">Skip</div>
      </div>
        `;

        changeView();
      } else {
        console.log(data);
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

submitButton.addEventListener("click", submitGenres);

function changeView() {
  let joinButton = document.getElementById("join");
  let createButton = document.getElementById("create");
  let skipButton = document.getElementById("skip");

  let isSkip = true;

  joinButton.addEventListener("click", () => {
    if (createButton.classList.contains("clicked")) {
      isSkip = true;
      createButton.classList.remove("clicked");
    }
    joinButton.classList.toggle("clicked");

    if (isSkip === true) {
      isSkip = false;
      skipButton.textContent = "Next";
    } else {
      isSkip = true;
      skipButton.textContent = "Skip";
    }
  });

  createButton.addEventListener("click", () => {
    if (joinButton.classList.contains("clicked")) {
      isSkip = true;
      joinButton.classList.remove("clicked");
    }
    createButton.classList.toggle("clicked");

    if (isSkip === true) {
      isSkip = false;
      skipButton.textContent = "Next";
    } else {
      isSkip = true;
      skipButton.textContent = "Skip";
    }
  });

  skipButton.addEventListener("click", () => {
    if (isSkip) {
      alert("skip to next page");
    } else {
      if (joinButton.classList.contains("clicked")) {
        mainBox.innerHTML = `
            <div id="innerGroup">
            <div class="titleGroup" id="title">Enter Group Code</div>
            <div class="mainButton" id="join">Join</div>
            <div class="mainButton" id="create">Create</div>
            <div id="mainButtons">
            <div id="back">Back</div>
            <div id="skip">Skip</div>
            </div>
          </div>
            `;

        processJoin();
      } else if (createButton.classList.contains("clicked")) {
        mainBox.innerHTML = `
            <div id="innerGroupCreate">
            <div class="titleGroup" id="title">Create a Group</div>
            <div>
                <input
                type="text"
                id="groupName"
                name="groupName"
                placeholder="Enter group name"
              />
            </div>
            <div id="bigBlock">
            <div id="groupType">
            <div class="groupButtonTitle">Type</div>
            <div class="groupButtons">Movie</div>
            <div class="groupButtons">Book</div>
            </div>
            <div id="privacyBlock">
            <div class="groupButtonTitle">Access</div>
            <div class="groupButtons">Public</div>
            <div class="groupButtons">Private</div>
            </div>
            </div>
            <div id="mainButtons">
            <div id="back">Back</div>
            <div id="createGroup">Create</div>
            </div>
            </div>
          </div>
            `;
        processCreate();
      }
    }
  });

  function processJoin() {
    let backButton = document.getElementById("back");

    backButton.addEventListener("click", () => {
      mainBox.innerHTML = `
        <div id="innerGroup">
        <div class="titleGroup" id="title">Join or Create Group?</div>
        <div class="mainButton" id="join">Join</div>
        <div class="mainButton" id="create">Create</div>
        <div id="skip">Skip</div>
      </div>
        `;

      changeView();
    });
  }

  function processCreate() {
    let backButton = document.getElementById("back");
    let groupNameInput = document.getElementById("groupName");
    let createGroupButton = document.getElementById("createGroup");

    let groupType = null;
    let access = null;

    backButton.addEventListener("click", () => {
      mainBox.innerHTML = `
        <div id="innerGroup">
        <div class="titleGroup" id="title">Join or Create Group?</div>
        <div class="mainButton" id="join">Join
        </div>
        <div class="mainButton" id="create">Create</div>
        <div id="skip">Skip</div>
      </div>
        `;

      changeView();
    });

    let groupTypeButtons = document.querySelectorAll(
      "#groupType .groupButtons"
    );

    groupTypeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        groupTypeButtons.forEach((each) =>
          each.classList.remove("clickedGroupButton")
        );
        button.classList.add("clickedGroupButton");
        groupType = button.textContent.trim().toLowerCase();
      });
    });

    let accessButtons = document.querySelectorAll(
      "#privacyBlock .groupButtons"
    );
    accessButtons.forEach((button) => {
      button.addEventListener("click", () => {
        accessButtons.forEach((each) =>
          each.classList.remove("clickedGroupButton")
        );
        button.classList.add("clickedGroupButton");
        access = button.textContent.trim().toLowerCase();
      });
    });

    createGroupButton.addEventListener("click", () => {
      let groupName = groupNameInput ? groupNameInput.value.trim() : null;

      if (!groupName || !groupType || !access) {
        alert("Missing input");
        return;
      }

      let groupData = {
        groupName: groupName,
        groupType: groupType,
        access: access,
        leaderId: localStorage.getItem("userID"),
      };

      fetch("/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            // go to home
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  }
}
