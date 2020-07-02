const LoginForm = document.querySelector("#LoginForm");

LoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  axios
    .post("/api/login", {
      Email: e.target.elements.LoginEmail.value,
      Password: e.target.elements.LoginPassword.value,
    })
    .then((response) => {
      //   localStorage.setItem("auth-token", response.data);
      sessionStorage.setItem("auth-token", response.data);
      window.location = "index.html";
    })
    .catch((error) => {
      console.log(error);
    });
});
