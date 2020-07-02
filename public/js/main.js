const authToken = sessionStorage.getItem("auth-token");

let GlobalUsers = [];
let GlobalGroups = [];
let buildObj = {};

let selectedGroupId;

if (!authToken) {
  window.location = "login.html";
} else {
  window.onload = function () {
    const headers = {
      "auth-token": authToken,
    };

    axios
      .get("/chat/ug", { headers: headers })
      .then((response) => {
        GlobalUsers = response.data.AllUsers;
        GlobalGroups = response.data.Groups;

        this.renderUsers(response.data.AllUsers);
        this.renderGroups(response.data.Groups);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const addUser = document.querySelector("#ListUsers");
  const addGroup = document.querySelector("#ListGroups");

  function renderUsers(users) {
    // console.log(users);

    users.map((user) => {
      const userEle = document.createElement("li");

      userEle.classList.add("list-group-item");

      const nameEle = document.createElement("h5");

      nameEle.classList.add("hoverName");

      nameEle.id = user._id;

      nameEle.onclick = runOnClick;

      nameEle.innerText = user.Name;

      if (!user.PendingCount == 0) {
        const msgCount = document.createElement("span");

        msgCount.classList.add("dot");

        msgCount.innerText = user.PendingCount;

        nameEle.appendChild(msgCount);
      }

      // userEle.id = user._id;

      // userEle.onclick = tempOnClick;

      // userEle.innerText = user.Name;

      const previewMsg = document.createElement("p");

      previewMsg.title = user.Preview;

      previewMsg.classList.add("msgStyle");

      if (!user.Preview) {
        previewMsg.innerText = "";
      } else {
        previewMsg.innerText = user.Preview;
      }

      // previewMsg.appendChild(msgCount);

      userEle.appendChild(nameEle);

      userEle.appendChild(previewMsg);

      // userEle.appendChild(msgCount);

      addUser.appendChild(userEle);
    });
  }

  // function tempOnClick(e) {
  //   console.log(e.target);
  // }

  function renderGroups(groups) {
    console.log(groups);

    groups.map((groups) => {
      const groupEle = document.createElement("li");

      groupEle.classList.add("list-group-item");

      groupEle.id = groups._id;

      groupEle.onclick = runOnClick;

      groupEle.innerText = groups.NameOfTheGroup;

      addGroup.appendChild(groupEle);
    });
  }

  function runOnClick(e) {
    const title = document.querySelector(".nameContainer");

    if (e.target.childElementCount != 0) {
      e.target.firstElementChild.remove();
    }

    title.children[0].innerText = e.target.innerText;

    const messages = document.querySelector(".messages");

    messages.innerHTML = "";

    if (e.target.parentNode.id == "ListGroups") {
      const grpClicked = GlobalGroups.filter((grp) => {
        return grp._id === e.target.id;
      });

      const ifExist = document.querySelector("#ActiveStatus");

      if (ifExist) {
        ifExist.remove();
      }

      buildObj = { ...grpClicked[0] };

      buildObj.isGroup = true;

      buildObj.token = authToken;

      // To Verify Connected User
      // socket.emit("forDB", authToken);

      socket.emit("openChat", buildObj, function (response) {
        if (response.isAdmin == true) {
          const userBtn = document.querySelector(".addSelect");

          userBtn.id = e.target.id;

          userBtn.onclick = getUsersForGroup;

          userBtn.classList.remove("addUserBtn");
        }

        const addedUserBtn = document.querySelector(".addedSelect");

        addedUserBtn.id = e.target.id;

        addedUserBtn.onclick = getUsersInGroup;

        addedUserBtn.classList.remove("addedUserBtn");
      });
    } else {
      const userClicked = GlobalUsers.filter((user) => {
        return user._id === e.target.id;
      });

      // document.getElementById(e.target.id);

      buildObj = { ...userClicked[0] };

      buildObj.isGroup = false;

      buildObj.token = authToken;

      // Hide buttons
      const userBtn = document.querySelector(".addSelect");

      userBtn.classList.add("addUserBtn");

      const addedUserBtn = document.querySelector(".addedSelect");

      addedUserBtn.classList.add("addedUserBtn");

      //Hide Divs
      const addedUser = document.querySelector(".addedUser");
      const addUser = document.querySelector(".addUser");

      addedUser.style.display = "none";
      addUser.style.display = "none";

      // To Verify Connected User
      // socket.emit("forDB", authToken);

      socket.emit("openChat", buildObj, function (response) {
        const ifExist = document.querySelector("#ActiveStatus");

        if (ifExist) {
          ifExist.remove();
        }

        const lastSeenEle = document.createElement("h6");

        lastSeenEle.id = "ActiveStatus";

        if (response.isActive == true) {
          lastSeenEle.innerText = "Online";
        } else {
          lastSeenEle.innerText = `Last seen ${response.isActive}`;
        }

        document.querySelector(".title").appendChild(lastSeenEle);

        console.log(response);
      });
    }

    // this.renderChat()
    // renderChat()
  }

  function getUsersInGroup(e) {
    const headers = {
      "auth-token": authToken,
      GroupId: e.target.id,
    };

    axios
      .get("/api/getgroupuser", {
        headers: headers,
      })
      .then((response) => {
        const allUsers = response.data.AllUsers;

        const addUserElement = document.querySelector("#addedUserList");

        addUserElement.innerHTML = "";

        allUsers.map((users) => {
          const userEle = document.createElement("li");

          userEle.classList.add("list-group-item");

          userEle.id = users.Details._id;

          // userEle.onclick = addUserToGroup;

          userEle.innerText = users.Name;

          console.log("Is Admin: ", users.isGroupAdmin);

          if (response.data.isAdmin) {
            if (!users.isGroupAdmin) {
              const isActivatedEle = document.createElement("button");
              isActivatedEle.innerText = "Deactivate!";
              isActivatedEle.id = e.target.id;
              isActivatedEle.classList.add("btn");
              isActivatedEle.classList.add("btn-warning");
              isActivatedEle.classList.add("ml-2");
              isActivatedEle.onclick = updateGroupUsersStatus;
              userEle.appendChild(isActivatedEle);

              // isActivatedEle.setAttribute("aria-disabled", true);

              const isAuthorizedEle = document.createElement("button");
              isAuthorizedEle.innerText = "Delete!";
              isAuthorizedEle.id = e.target.id;
              isAuthorizedEle.classList.add("btn");
              isAuthorizedEle.classList.add("btn-danger");
              isAuthorizedEle.classList.add("ml-2");
              isAuthorizedEle.onclick = deleteGroupUser;
              userEle.appendChild(isAuthorizedEle);
            }
          }

          addUserElement.appendChild(userEle);
        });

        const addedUser = document.querySelector(".addedUser");
        const addUser = document.querySelector(".addUser");

        addUser.style.display = "none";
        addedUser.style.display = "inline-flex";
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getUsersForGroup(e) {
    selectedGroupId = e.target.id;

    const headers = {
      "auth-token": authToken,
      GroupId: e.target.id,
    };

    axios
      .get("/api/addusertogroup", {
        headers: headers,
      })
      .then((response) => {
        const allUsers = response.data.AllUsers;

        const addUserElement = document.querySelector("#addUserList");

        addUserElement.innerHTML = "";

        allUsers.map((users) => {
          const userEle = document.createElement("li");

          userEle.classList.add("list-group-item");

          userEle.id = users.Details._id;

          userEle.onclick = addUserToGroup;

          userEle.innerText = users.Name;

          addUserElement.appendChild(userEle);
        });

        const addUser = document.querySelector(".addUser");
        const addedUser = document.querySelector(".addedUser");

        addedUser.style.display = "none";
        addUser.style.display = "inline-flex";
      })
      .catch((error) => {
        console.log(error);
      });

    // sessionStorage.setItem("grpId", e.target.id);

    // window.location = "addUserToGroup.html";
  }

  function addUserToGroup(e) {
    const headers = {
      "auth-token": authToken,
    };

    axios
      .post(
        "/api/addusertogroup",
        {
          GroupId: selectedGroupId,
          UserId: e.target.id,
        },
        {
          headers: headers,
        }
      )
      .then((response) => {
        // console.log(response);
        const removing = document.getElementById(e.target.id);

        removing.remove();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function updateGroupUsersStatus(e) {
    const headers = {
      "auth-token": authToken,
    };

    axios
      .post(
        "/api/updategroupuserstatus",
        { GroupId: e.target.id, UserId: e.target.parentNode.id },
        { headers: headers }
      )
      .then((response) => {
        // console.log(response);
        if (e.target.innerText == "Deactivate!") {
          e.target.innerText = "Re-Activate!";
        } else {
          e.target.innerText = "Deactivate!";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function deleteGroupUser(e) {
    const headers = {
      "auth-token": authToken,
    };
    axios
      .post(
        "/api/deletegroupuser",
        { GroupId: e.target.id, UserId: e.target.parentNode.id },
        { headers: headers }
      )
      .then((response) => {
        // console.log(response);

        const removing = document.getElementById(e.target.parentNode.id);

        removing.remove();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const chatForm = document.querySelector("#MsgForm");
  const chatMessages = document.querySelector(".messages");

  const socket = io();

  // Immediately After Connetions
  socket.emit("forDB", authToken);

  // Message from server
  socket.on("message", (message) => {
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // UpdatePendingMessageStatus
  socket.on("changeStatus", (msgArray) => {
    let theColor;

    const getMsg = document.getElementById(msgArray.MessageId);

    if (getMsg) {
      if (msgArray.isDelivered) {
        theColor = "black";
      }
      if (msgArray.isSeen) {
        theColor = "#22d1ee";
      }
      getMsg.style.borderBottom = `2px solid ${theColor}`;
    }
  });

  socket.on("updatePreviewMsg", (previewMessage) => {
    console.log(previewMessage.id);
    const getParent = document.getElementById(previewMessage.id);
    const getPreviewElement = getParent.nextElementSibling;

    console.log(getPreviewElement);

    getPreviewElement.title = previewMessage.Message;
    getPreviewElement.innerText = previewMessage.Message;

    if (previewMessage.count) {
      if (getParent.childElementCount != 0) {
        getParent.firstElementChild.innerText = previewMessage.count;
      } else {
        const msgCount = document.createElement("span");

        msgCount.classList.add("dot");

        msgCount.innerText = previewMessage.count;

        getParent.appendChild(msgCount);
      }
    }
  });

  // Message Submit
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    buildObj.Message = msg;

    buildObj.token = authToken;

    // Emit Message to Server
    socket.emit("chatMessage", buildObj, function (response) {
      console.log(response);
    });

    // Clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  });

  // Output Message to DOM
  function outputMessage(message) {
    const messages = document.querySelector(".messages");

    let theColor;
    if (!message.isSender) {
      theColor = "none";
    } else {
      if (message.isSeen == true) {
        theColor = "#22d1ee";
      } else {
        if (message.isDelivered == true) {
          theColor = "black";
        } else {
          theColor = "#ff304f";
        }
      }
    }

    // messages.innerText = "";

    const divToastContainer = document.createElement("div");
    divToastContainer.classList.add("toast-container");

    if (message.isSender == true) {
      divToastContainer.style.marginLeft = "auto";
      divToastContainer.style.marginRight = "5px";
    }

    const divToastHeader = document.createElement("div");
    divToastHeader.classList.add("toast-header");

    const strongTag = document.createElement("strong");
    strongTag.classList.add("mr-auto");
    strongTag.innerText = message.username;

    const smallTag = document.createElement("small");
    smallTag.innerText = message.time;

    divToastHeader.appendChild(strongTag);
    divToastHeader.appendChild(smallTag);

    const divToastBody = document.createElement("div");
    divToastBody.id = message.Id;
    divToastBody.classList.add("toast-body");
    divToastBody.style.borderBottom = `2px solid ${theColor}`;
    divToastBody.innerText = message.text;

    divToastContainer.appendChild(divToastHeader);
    divToastContainer.appendChild(divToastBody);

    // div.innerHTML = `
    //   <div class="toast-header">
    //     <strong class="mr-auto">${message.username}</strong>
    //     <small>${message.time}</small>
    //   </div>
    //   <div style="border-bottom: 2px solid #ff304f;" class="toast-body">
    //     ${message.text}
    //   </div>
    // `;

    messages.appendChild(divToastContainer);
  }

  // function renderChat(message) {
  //   const messages = document.querySelector(".messages");

  //   messages.innerText = "";
  // #30e3ca - green
  // #22d1ee - blue
  //   outputMessage(message);
  // }
}
