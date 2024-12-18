let groupButton = document.getElementById("modalButton");
let watchButton = document.getElementById("modalButtonWatch");
let mainCloseButton = document.getElementById("mainGroupModalButton");
let mainWatchCloseButton = document.getElementById("mainWatchModalButton");
let joinCloseButton = document.getElementById("joinGroupModalButton");
let addCloseButton = document.getElementById("createGroupModalButton");

let mainModal = document.getElementById("mainModal");
let mainModalWatch = document.getElementById("mainModalWatch");
let joinModal = document.getElementById("joinModal");
let createModal = document.getElementById("createModal");

let joinButton = document.getElementById("joinButton");
let addButton = document.getElementById("addButton");

let joinGroupHome = document.getElementById("joinGroupHome");
let joinAddButton = document.getElementById("joinAddButton");

let createGroupHome = document.getElementById("createHomeButton");
let createJoinButton = document.getElementById("createJoinButton");

let searchSection = document.getElementById("searchBox");
let searchButton = document.getElementById("searchFilm");
let searchResult = document.getElementById("searchResult");
let searchType = document.getElementById("searchType");

let accountButton = document.getElementById("account");
let logoutButton = document.getElementById("logout");
let homeButton = document.getElementById("home");

homeButton.addEventListener("click", () => {
  window.location.href = "/selection.html";
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

displayGroups();

function closeModals() {
  mainModal.classList.add("hidden");
  mainModalWatch.classList.add("hidden");
  joinModal.classList.add("hidden");
  createModal.classList.add("hidden");
}

groupButton.addEventListener("click", () => {
  mainModal.classList.toggle("hidden");
});

watchButton.addEventListener("click", () => {
  mainModalWatch.classList.toggle("hidden");
});

joinButton.addEventListener("click", () => {
  joinModal.classList.toggle("hidden");
});

addButton.addEventListener("click", () => {
  createModal.classList.toggle("hidden");
});

mainCloseButton.addEventListener("click", () => {
  closeModals();
});

mainWatchCloseButton.addEventListener("click", () => {
  closeModals();
});

joinCloseButton.addEventListener("click", () => {
  closeModals();
});

addCloseButton.addEventListener("click", () => {
  closeModals();
});

joinGroupHome.addEventListener("click", () => {
  closeModals();
  mainModal.classList.toggle("hidden");
});

joinAddButton.addEventListener("click", () => {
  closeModals();
  createModal.classList.toggle("hidden");
});

createGroupHome.addEventListener("click", () => {
  closeModals();
  mainModal.classList.toggle("hidden");
});

createJoinButton.addEventListener("click", () => {
  closeModals();
  joinModal.classList.toggle("hidden");
});

function processJoinModal() {
  let groupCodeInput = document.getElementById("code");
  let randomButton = document.getElementById("random");
  let joinGroupButton = document.getElementById("joinGroup");

  let isRandom = false;

  groupCodeInput.addEventListener("input", () => {
    if (groupCodeInput.value.trim() !== "") {
      randomButton.classList.remove("randomClicked");
      isRandom = false;
    }
  });

  randomButton.addEventListener("click", () => {
    randomButton.classList.toggle("randomClicked");
    groupCodeInput.value = "";
    if (randomButton.classList.contains("randomClicked")) {
      isRandom = true;
    } else {
      isRandom = false;
    }
  });

  joinGroupButton.addEventListener("click", () => {
    handleJoinGroup();
  });

  function handleJoinGroup() {
    let groupCodeVal = groupCodeInput.value.trim();

    if (isRandom) {
      let groupCodeData = {
        type: "random",
        code: "",
        userId: localStorage.getItem("userId"),
      };
      //console.log(groupCodeData.userId);

      alert("join random");
      fetch("/joinGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupCodeData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            closeModals();
            mainModal.classList.remove("hidden");
            displayGroups();
            let type = data.group.group_type;

            let joinedGroupName = data.group.group_name;

            if (type === "book") {
              window.location.href = `/bookGroup/${joinedGroupName}`;
            } else {
              window.location.href = `/movieGroup/${joinedGroupName}`;
            }
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (groupCodeVal !== "") {
      let groupCodeData = {
        type: "code",
        code: groupCodeVal,
        userId: localStorage.getItem("userId"),
      };
      alert(`joining with code ${groupCodeVal}`);
      fetch("/joinGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupCodeData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            closeModals();
            mainModal.classList.remove("hidden");
            displayGroups();
            let type = data.group.group_type;
            let joinedGroupName = data.group.group_name;
            if (type === "book") {
              window.location.href = `/bookGroup/${joinedGroupName}`;
            } else {
              window.location.href = `/movieGroup/${joinedGroupName}`;
            }
          } else {
            console.log(data);
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      alert("please enter group code or select random");
    }
  }
}

function processCreateModal() {
  let groupNameInput = document.getElementById("name");
  let createGroupButton = document.getElementById("create");

  let groupType = null;
  let access = null;

  let groupTypeButtons = document.querySelectorAll(
    "#typeButtonsModalType .groupButtons"
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
    "#typeButtonsModalAccess .groupButtons"
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
      leaderId: localStorage.getItem("userId"),
    };

    //console.log(groupData);

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
          closeModals();
          mainModal.classList.remove("hidden");
          displayGroups();
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

processJoinModal();
processCreateModal();

async function displayGroups() {
  let groupsDiv = document.getElementById("groups");
  let groupsList = document.getElementById("groupsList");
  let userId = localStorage.getItem("userId");

  fetch(`/getGroups/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        let myGroups = [];
        let colors = ["red", "orange", "green", "blue", "purple"];
        let divStruct = ``;

        data.rows.forEach((row) => {
          myGroups.push(row.group_name);
          let randomColor = colors[Math.floor(Math.random() * colors.length)];
          divStruct += `
          <li>
          <div class="groupItemBox">
            <div class="marker ${randomColor}">
            </div>
            <a class="groupModalLinks" href='/${row.group_type}Group/${row.group_name}'>${row.group_name}</a>
          </div>
            </li>
            <div class="line"> </div>
          `;
        });
        groupsList.innerHTML = divStruct;
      } else {
        alert(data.message);
      }
    });
}

logoutButton.addEventListener("click", () => {
  localStorage.clear("userId");
  // make fetch request to clear the cookie as well fetch('/clearCookie')
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

displayGroups();
