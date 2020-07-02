const RegisterOrg = document.querySelector("#ResisterOrgForm");

RegisterOrg.addEventListener("submit", (e) => {
  e.preventDefault();

  axios
    .post("/api/register", {
      Name: e.target.elements.OrgName.value,
      Address: e.target.elements.OrgAddress.value,
      City: e.target.elements.OrgCity.value,
      State: e.target.elements.OrgState.value,
      Country: e.target.elements.OrgCountry.value,
      CountryCode: e.target.elements.OrgCountryCode.value,
      MobileNo: e.target.elements.OrgMobileNo.value,
      Description: e.target.elements.OrgDescription.value,
      TypeOfOrganization: e.target.elements.OrgType.value,
      OrganizationEmail: e.target.elements.OrgEmail.value,
      UsersCredit: e.target.elements.OrgUsersCredit.value,
      GroupsCredit: e.target.elements.OrgGroupsCredit.value,
      RegistrationType: e.target.elements.OrgRegistrationType.value,
      LogoUrl: e.target.elements.OrgLogoUrl.value,
      Admin: {
        Name: e.target.elements.AdminName.value,
        ProfileUrl: e.target.elements.AdminProfile.value,
        Email: e.target.elements.AdminEmail.value,
        Password: e.target.elements.AdminPassword.value,
        UserName: e.target.elements.AdminUserName.value,
        CountryCode: e.target.elements.AdminCountryCode.value,
        MobileNo: e.target.elements.AdminMobileNo.value,
      },
    })
    .then((response) => {
      sessionStorage.setItem("auth-token", response.data);
      window.location = "addUser.html";
    })
    .catch((err) => {
      console.log(err);
    });

  //   const OrgName = e.target.elements.OrgName.value;

  //   console.log(OrgName);
});
