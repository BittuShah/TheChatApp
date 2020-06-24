// const mongoose = require("mongoose");

//DB Connections
const { PersonalDB } = require("../../startup/db");

let PersonalConn;

//Models and Schemas
const Organization = require("../Models/OrganizationModel");
const OrganizationUsers = require("../Models/OrganizationUsersModel");
const personalUsersSchema = require("../Schemas/PersonlUsersSchema");
const groupsCreatedBySchema = require("../Schemas/GroupsCreatedBySchema");
const userInGroupSchema = require("../Schemas/UsersInGroupSchema");
const groupChatSchema = require("../Schemas/GroupChatSchema");
const userChatSchema = require("../Schemas/UserChatSchema");
const pendingMessageSchema = require("../Schemas/PendingMessagesSchema");

//Other Utility libraries
const bcrypt = require("bcryptjs");
const moment = require("moment");

async function createOrg(fields) {
  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(fields.Admin.Password, salt);
  } catch (error) {
    console.log(error);
  }

  const organizationObj = new Organization({
    Name: fields.Name,
    Address: fields.Address,
    City: fields.City,
    State: fields.State,
    Country: fields.Country,
    CountryCode: fields.CountryCode,
    MobileNo: fields.MobileNo,
    Description: fields.Description,
    TypeOfOrganization: fields.TypeOfOrganization,
    OrganizationEmail: fields.OrganizationEmail,
    UsersCredit: fields.UsersCredit,
    CurrentNoOfUsers: 1,
    GroupsCredit: fields.GroupsCredit,
    CurrentNoOfGroups: 2,
    RegistrationType: fields.RegistrationType,
    LogoUrl: fields.LogoUrl,
    Admin: {
      Name: fields.Admin.Name,
      ProfileUrl: fields.Admin.ProfileUrl,
      Email: fields.Admin.Email,
      Password: hashedPassword,
      UserName: fields.Admin.UserName,
      CountryCode: fields.Admin.CountryCode,
      MobileNo: fields.Admin.MobileNo,
      isActivated: true,
      isAuthorized: true,
    },
  });

  try {
    const savedOrganization = await organizationObj.save();
    return savedOrganization;
  } catch (error) {
    return error;
  }
}

async function createOrgUser(
  Name,
  ProfileUrl,
  Email,
  Password,
  UserName,
  CountryCode,
  MobileNo,
  CustomerId,
  isAdmin = false
) {
  const organizationUsersObj = new OrganizationUsers({
    Name: Name,
    ProfileUrl: ProfileUrl,
    Email: Email,
    Password: Password,
    UserName: UserName,
    CountryCode: CountryCode,
    MobileNo: MobileNo,
    isAdmin: isAdmin,
    isActivated: true,
    isActive: false,
    isAuthorized: true,
    CustomerId: CustomerId,
  });

  try {
    const savedOrgUser = await organizationUsersObj.save();
    return savedOrgUser;
  } catch (error) {
    return error;
  }
}

async function createPersonalUser(dbId, refUserId) {
  PersonalConn = await PersonalDB(dbId);

  const PersonalUserModel = PersonalConn.model("Users", personalUsersSchema);

  const personalUserObj = new PersonalUserModel({
    Roles: "Dev",
    Status: true,
    UserId: refUserId,
  });

  try {
    const savedUser = await personalUserObj.save();
    return savedUser;
  } catch (error) {
    return error;
  }
}

async function createDefaultGroups(dbId, refUserId) {
  const DefaultGroups = [
    { NameOfGroup: "HR", Details: "For hr related items" },
    { NameOfGroup: "Social", Details: "For Social Discussion!" },
  ];

  PersonalConn = await PersonalDB(dbId);

  const GroupsCreatedByModel = PersonalConn.model(
    "GroupsCreatedBy",
    groupsCreatedBySchema
  );

  DefaultGroups.map(async (groups) => {
    const GroupsCreatedByObj = new GroupsCreatedByModel({
      NameOfTheGroup: groups.NameOfGroup,
      Details: groups.Details,
      NumberOfUsers: 1,
      LogoUrl: groups.NameOfGroup + ".jpg",
      isDefault: true,
      UserId: refUserId,
    });

    try {
      const savedGroup = await GroupsCreatedByObj.save();

      await addUserInGroup(dbId, savedGroup._id, refUserId);
    } catch (error) {
      return error;
    }
  });
}

async function createGroup(dbId, NameOfTheGroup, Details, LogoUrl, UserId) {
  PersonalConn = await PersonalDB(dbId);

  const GroupsCreatedByModel = PersonalConn.model(
    "GroupsCreatedBy",
    groupsCreatedBySchema
  );

  const GroupsCreatedByObj = new GroupsCreatedByModel({
    NameOfTheGroup: NameOfTheGroup,
    Details: Details,
    NumberOfUsers: 1,
    LogoUrl: LogoUrl,
    isDefault: false,
    UserId: UserId,
  });

  try {
    const savedGroup = await GroupsCreatedByObj.save();

    await addUserInGroup(dbId, savedGroup._id, UserId);

    return savedGroup;
  } catch (error) {
    return error;
  }
}

async function addUserInGroup(dbId, GroupId, UserId) {
  PersonalConn = await PersonalDB(dbId);

  const UserInGroupModel = PersonalConn.model(
    "UsersInGroup",
    userInGroupSchema
  );

  const UserInGroupObj = new UserInGroupModel({
    GroupId: GroupId,
    UserId: UserId,
    isActivated: true,
    isAuthorized: true,
  });

  try {
    await UserInGroupObj.save();
  } catch (error) {
    return error;
  }
}

async function createChatMsg(dbId, collName, isGroup, From, Message, To = "") {
  PersonalConn = await PersonalDB(dbId);

  let createChatObj;

  if (isGroup) {
    const GroupChatModel = PersonalConn.model(collName, groupChatSchema);

    createChatObj = new GroupChatModel({
      From: From,
      Message: Message,
      CreatedAt: moment().utc("+5:30").format(),
    });
  } else {
    const UserChatModel = PersonalConn.model(collName, userChatSchema);

    createChatObj = new UserChatModel({
      From: From,
      To: To,
      Message: Message,
      CreatedAt: moment().utc("+5:30").format(),
    });
  }

  try {
    const savedMsg = await createChatObj.save();
    return savedMsg;
  } catch (error) {
    console.log(error);
  }
}

async function createPendingMessage(
  dbId,
  senderId,
  receiverId,
  messageId,
  isDelivered
) {
  PersonalConn = PersonalDB(dbId);

  const PendingMessageModel = PersonalConn.model(
    "PendingMessages",
    pendingMessageSchema
  );

  const createChatObj = new PendingMessageModel({
    SenderId: senderId,
    ReceiverId: receiverId,
    MessageId: messageId,
    isDelivered: isDelivered,
  });

  const savedPendingMsg = await createChatObj.save();

  return savedPendingMsg;
}

module.exports.CreateOrg = createOrg;
module.exports.CreateOrgUser = createOrgUser;
module.exports.CreatePersonalUser = createPersonalUser;
module.exports.CreateDefaultGroups = createDefaultGroups;
module.exports.AddUserInGroup = addUserInGroup;
module.exports.CreateGroup = createGroup;
module.exports.CreateChatMsg = createChatMsg;
module.exports.CreatePendingMessage = createPendingMessage;
