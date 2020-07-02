const authToken = sessionStorage.getItem("auth-token");

const GroupId = sessionStorage.getItem("grpId");

const headers = {
  "auth-token": sessionStorage.getItem("auth-token"),
  GroupId: GroupId,
};

axios
  .get("/api/addusertogroup", {
    headers: headers,
  })
  .then((response) => {
    // console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
