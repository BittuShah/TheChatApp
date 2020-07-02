const body = document.querySelector("#protected");

const authToken = sessionStorage.getItem("auth-token");

if (!authToken) {
  alert("Please Login to access this route!");
  body.innerHTML = "";
}

const AddGroupForm = document.querySelector("#AddGroupForm");

AddGroupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const headers = {
    "auth-token": authToken,
  };

  axios
    .post(
      "/api/creategroup",
      {
        NameOfTheGroup: e.target.elements.GroupName.value,
        Details: e.target.elements.GroupDetail.value,
        LogoUrl: e.target.elements.GroupLogo.value,
      },
      {
        headers: headers,
      }
    )
    .then((response) => {
      // console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
});
