const router = require("express").Router();
const mongoose = require("mongoose");

//Helper Functions
const {
  CreateOrg,
  CreateOrgUser,
  CreatePersonalUser,
  CreateDefaultGroups,
  CreateGroup,
  AddUserInGroup,
} = require("../MongoDB/Helpers/savingHelper");
const {
  FindOneOrganizationUser,
  FindOnePersonalUser,
  FindAllPersonalUsers,
  FindUserInGroup,
  FindGroups,
} = require("../MongoDB/Helpers/findingHelper");
const {
  UpdateOrganizationUsers,
  UpdatePendingMessages,
  UpdateGroupUser,
} = require("../MongoDB/Helpers/updatingHelper");
const { DeleteUserInGroup } = require("../MongoDB/Helpers/deletingHelper");
const { CreateJWTToken } = require("../utils/createToken");

// Other Libraries
const _ = require("lodash");
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// MiddleWares
const { AuthAdmin, AuthUser } = require("../middlewares/verifyToken");

router.post("/register", async (req, res) => {
  // Check if the req.bosy is empty or not
  if (Object.keys(req.body).length == 0)
    return res.status(401).send({ ErrMsg: "Please Fill all the details!" });

  try {
    // Saving it to mongoDB
    let savedOrganization = await CreateOrg(req.body);

    // After saving Ogranization Detail, Creating Admin User
    if (savedOrganization) {
      const savedOrgUser = await CreateOrgUser(
        savedOrganization.Admin.Name,
        savedOrganization.Admin.ProfileUrl,
        savedOrganization.Admin.Email,
        savedOrganization.Admin.Password,
        savedOrganization.Admin.UserName,
        savedOrganization.Admin.CountryCode,
        savedOrganization.Admin.MobileNo,
        savedOrganization._id,
        true
      );

      console.log("Before: ", savedOrgUser.CustomerId);
      

      const savedUser = await CreatePersonalUser(
        savedOrgUser.CustomerId,
        savedOrgUser._id
      );

      console.log("After: ", savedOrgUser.CustomerId);

      try {
        await CreateDefaultGroups(savedOrgUser.CustomerId, savedUser._id);
      } catch (error) {
        console.log(error);
      }

      const token = CreateJWTToken(
        savedOrgUser._id,
        savedOrgUser.Email,
        savedOrgUser.CustomerId,
        savedOrgUser.isAdmin,
        savedUser._id
      );

      res.status(200).header("auth-token", token).send(token);
      // res.redirect("/index.html");
    }
  } catch (err) {
    if (err.code == 11000) {
      return res
        .status(400)
        .send({ ErrMsg: "This Email is already registered!" });
    }
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  // Check if the req.bosy is empty or not
  if (Object.keys(req.body).length == 0)
    return res.status(401).send({ ErrMsg: "Please Fill all the details!" });

  // Validating Email
  const user = await FindOneOrganizationUser({ Email: req.body.Email });
  // const user = await OrganizationUsers.findOne({ Email: req.body.Email });
  if (!user)
    return res.status(400).send({ ErrMsg: "Email Or Password is Inorrect!" });

  // Validating Password
  const validPass = await bcrypt.compare(req.body.Password, user.Password);
  if (!validPass)
    return res.status(400).send({ ErrMsg: "Email Or Password is Inorrect!" });

  const theUser = await FindOnePersonalUser(user.CustomerId, {
    UserId: user._id,
  });

  const UpdatedPendingMessages = await UpdateOrganizationUsers(
    { _id: user._id },
    { isActive: true }
  );

  await UpdatePendingMessages(
    user.CustomerId,
    { ReceiverId: theUser._id },
    { isDelivered: true }
  );

  // Generating Token
  const token = CreateJWTToken(
    user._id,
    user.Email,
    user.CustomerId,
    user.isAdmin,
    theUser._id
  );

  res.header("auth-token", token).status(200).send(token);
});

router.post("/registeruser", AuthAdmin, async (req, res) => {
  // Check if the req.bosy is empty or not
  if (Object.keys(req.body).length == 0)
    return res.status(401).send({ ErrMsg: "Please Fill all the details!" });

  // Hashing Password
  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(req.body.Password, salt);
  } catch (err) {
    return res.status(400).send("Please Fill all the details!");
  }

  try {
    const savedUser = await CreateOrgUser(
      req.body.Name,
      req.body.ProfileUrl,
      req.body.Email,
      hashedPassword,
      req.body.UserName,
      req.body.CountryCode,
      req.body.MobileNo,
      req.user.CustomerId
    );

    try {
      const savedPersonalUser = await CreatePersonalUser(
        savedUser.CustomerId,
        savedUser._id
      );
    } catch (error) {
      throw err;
    }

    return res.status(200).send(savedUser._id);
  } catch (err) {
    if (err.code == 11000) {
      return res
        .status(400)
        .send({ ErrMsg: "This Email is already registered!" });
    }
    return res.status(400).send({ ErrMsg: err });
  }
});

router.post("/creategroup", AuthUser, async (req, res) => {
  // Check if the req.bosy is empty or not
  if (Object.keys(req.body).length == 0)
    return res.status(401).send({ ErrMsg: "Please Fill all the details!" });

  try {
    const savedGroup = await CreateGroup(
      req.user.CustomerId,
      req.body.NameOfTheGroup,
      req.body.Details,
      req.body.LogoUrl,
      req.user._id
    );

    res.status(200).send(savedGroup._id);
  } catch (error) {
    res.status(400).send({ Error: "Something went Wrong!" });
  }
});

router.get("/addusertogroup", AuthUser, async (req, res) => {
  const GroupId = req.header("GroupId");

  let resultObj = {};

  let allUser = [];

  const personalUsers = await FindAllPersonalUsers(req.user.CustomerId);

  for (let i = 0; i < personalUsers.length; i++) {
    const usersInGroup = await FindUserInGroup(req.user.CustomerId, {
      UserId: personalUsers[i]._id,
      GroupId: GroupId,
    });

    if (usersInGroup.length == 0) {
      const userDetail = await FindOneOrganizationUser({
        _id: personalUsers[i].UserId,
      });

      const orgUser = { ...userDetail._doc };
      const childUser = { Details: personalUsers[i] };

      _.merge(orgUser, childUser);

      allUser.push(orgUser);
    }
  }

  resultObj["AllUsers"] = allUser;

  res.status(200).send(resultObj);
});

router.post("/addusertogroup", AuthUser, async (req, res) => {
  try {
    await AddUserInGroup(
      req.user.CustomerId,
      mongoose.Types.ObjectId(req.body.GroupId),
      mongoose.Types.ObjectId(req.body.UserId)
    );
    res.status(200).send({ SuccessMsg: "User Added to the group!" });
  } catch (error) {
    res.status(400).send({ Error: "Something went Wrong!" });
  }
});

router.get("/getgroupuser", AuthUser, async (req, res) => {
  let allUser = [];

  let resultObj = {};

  const GroupId = req.header("GroupId");

  const groupAdmin = await FindGroups(req.user.CustomerId, { _id: GroupId });

  // console.log("Group Admin: ", groupAdmin[0].UserId);

  // console.log("UserId: ", req.user._id);

  const isMainGroupAdmin = groupAdmin[0].UserId == req.user._id ? true : false;

  // console.log("Is Group Admin: ", isGroupAdmin);

  const groupUsers = await FindUserInGroup(req.user.CustomerId, {
    GroupId: GroupId,
  });

  for (let i = 0; i < groupUsers.length; i++) {
    const userInPersonal = await FindOnePersonalUser(req.user.CustomerId, {
      _id: groupUsers[i].UserId,
    });

    const userInOrg = await FindOneOrganizationUser({
      _id: userInPersonal.UserId,
    });

    const copyuserInPersonal = { Details: userInPersonal._doc };
    copyuserInPersonal["isActivated"] = groupUsers[i].isActivated;

    const isGroupAdmin = groupAdmin[0].UserId == userInPersonal._id;

    copyuserInPersonal["isGroupAdmin"] = isGroupAdmin;

    const copyuserInOrg = { ...userInOrg._doc };

    _.merge(copyuserInOrg, copyuserInPersonal);

    allUser.push(copyuserInOrg);
  }

  resultObj["AllUsers"] = allUser;
  resultObj["isAdmin"] = isMainGroupAdmin;

  res.status(200).send(resultObj);
});

router.post("/updategroupuserstatus", AuthUser, async (req, res) => {
  const getRecord = await FindUserInGroup(req.user.CustomerId, {
    GroupId: req.body.GroupId,
    UserId: req.body.UserId,
  });

  const updatedStatus = !getRecord[0].isActivated;

  await UpdateGroupUser(
    req.user.CustomerId,
    {
      GroupId: req.body.GroupId,
      UserId: req.body.UserId,
    },
    { isActivated: updatedStatus }
  );

  res.status(200).send({ SuccessMsg: "User Status changed!" });
});

router.post("/deletegroupuser", AuthUser, async (req, res) => {
  await DeleteUserInGroup(req.user.CustomerId, {
    GroupId: req.body.GroupId,
    UserId: req.body.UserId,
  });

  res.status(200).send({ SuccessMsg: "User Status changed!" });
});

module.exports = router;

// const cloneAdmin = { ...savedAdmin._doc };
// // Cloned And changed AdminUser Object to overcome the failure of same field name
// const cloneChanged = {
//   UserId: cloneAdmin._id,
//   ..._.omit(cloneAdmin, ["_id"]), // Clone all the unique detail
// };
// const cloneOrganization = { ...savedOrganization._doc };

// // _.merge(savedOrganization, savedAdmin);
// // Merged two cloned Object
// _.merge(cloneOrganization, cloneChanged);
