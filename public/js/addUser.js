const body = document.querySelector("#protected");

const authToken = sessionStorage.getItem("auth-token");

if (!authToken) {
  alert("You do not has access to this route!");
  body.innerHTML = "";
}

const AddUserForm = document.querySelector("#AddUserForm");

AddUserForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const headers = {
    "auth-token": authToken,
  };

  axios
    .post(
      "/api/registeruser",
      {
        Name: e.target.elements.Name.value,
        ProfileUrl: e.target.elements.UserProfile.value,
        Email: e.target.elements.UserEmail.value,
        Password: e.target.elements.UserPassword.value,
        UserName: e.target.elements.UserName.value,
        CountryCode: e.target.elements.UserCountryCode.value,
        MobileNo: e.target.elements.UserMobileNo.value,
      },
      { headers: headers }
    )
    .then((response) => {
      // console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
});
