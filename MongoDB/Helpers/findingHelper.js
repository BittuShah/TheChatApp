// const mongoose = require("mongoose");

// Db Connections
const { PersonalDB } = require("../../startup/db");

let PersonalConn;

// Models and Schemas
const Organization = require("../Models/OrganizationModel");
const OrganizationUser = require("../Models/OrganizationUsersModel");
const personalUsersSchema = require("../Schemas/PersonlUsersSchema");
const userInGroupSchema = require("../Schemas/UsersInGroupSchema");
const groupsCreatedBySchema = require("../Schemas/GroupsCreatedBySchema");
const groupChatSchema = require("../Schemas/GroupChatSchema");
const userChatSchema = require("../Schemas/UserChatSchema");
const pendingMessagesSchema = require("../Schemas/PendingMessagesSchema");
const { reject } = require("lodash");

async function findAllOrganization() {
  const allOrganization = await Organization.find();

  return allOrganization;
}

async function findOneOrganization(searchFilter) {
  const oneOrganization = await Organization.findOne(searchFilter);

  return oneOrganization;
}

async function findAllOrganizationUsers() {
  const allOrganizationUsers = await OrganizationUser.find();

  return allOrganizationUsers;
}

async function findOneOrganizationUser(searchFilter) {
  const oneOrganizationUser = await OrganizationUser.findOne(searchFilter);

  return oneOrganizationUser;
}

async function findAllPersonalUsers(dbId) {
  PersonalConn = await PersonalDB(dbId);

  const PersonalUserModel = PersonalConn.model("Users", personalUsersSchema);

  const PersonalUsers = await PersonalUserModel.find();

  return PersonalUsers;
}

async function findOnePersonalUser(dbId, searchFilter) {
  PersonalConn = await PersonalDB(dbId);

  const PersonalUserModel = PersonalConn.model("Users", personalUsersSchema);

  const PersonalUser = await PersonalUserModel.findOne(searchFilter);

  return PersonalUser;
}

async function findUserInGroup(dbId, searchFilter) {
  PersonalConn = await PersonalDB(dbId);

  const UserInGroupModel = PersonalConn.model(
    "UsersInGroup",
    userInGroupSchema
  );

  const userInGroup = await UserInGroupModel.find(searchFilter);

  return userInGroup;
}

async function findGroups(dbId, searchFilter) {
  PersonalConn = await PersonalDB(dbId);

  const GroupsCreatedBy = PersonalConn.model(
    "GroupsCreatedBy",
    groupsCreatedBySchema
  );

  const groups = await GroupsCreatedBy.find(searchFilter);

  return groups;
}

async function findGroupChat(dbId, collName) {
  PersonalConn = await PersonalDB(dbId);

  const GroupChatModel = PersonalConn.model(collName, groupChatSchema);

  const allMessages = await GroupChatModel.find();

  return allMessages;
}

async function findGroupChatSorted(dbId, collName, sortField) {
  PersonalConn = await PersonalDB(dbId);

  const GroupChatModel = PersonalConn.model(collName, groupChatSchema);

  const allMessages = await GroupChatModel.find().sort(sortField);

  return allMessages;
}

async function findUserChat(dbId, collName) {
  PersonalConn = await PersonalDB(dbId);

  const UserChatModel = PersonalConn.model(collName, userChatSchema);

  const allMessages = await UserChatModel.find();

  return allMessages;
}

async function findUserChatSorted(dbId, collName, sortField) {
  PersonalConn = await PersonalDB(dbId);

  const UserChatModel = PersonalConn.model(collName, userChatSchema);

  const allMessages = await UserChatModel.find().sort(sortField);

  return allMessages;
}

// async function makeDBConnection(dbId) {
//   PersonalConn = await PersonalDB(dbId);

//   return PersonalConn;
// }

async function findCollections(dbId, tryArr) {
  PersonalConn = PersonalDB(dbId);
  const collNames = [];

  let theCollection = "";

  return new Promise(async (resolve, reject) => {
    (await PersonalConn).db.listCollections().toArray(function (err, names) {
      if (!err) {
        for (let i = 0; i < names.length; i++) {
          // console.log("Names: ", names[i].name);

          collNames.push(names[i].name);
        }
        resolve();
      } else {
        reject();
      }
    });
  }).then(async () => {
    return new Promise((resolve, reject) => {
      console.log("TryArray: ", tryArr[0]);

      for (let i = 0; i < tryArr.length; i++) {
        const isCollection = collNames.indexOf(tryArr[i]);

        // console.log("colNames: ", collNames);

        console.log("Is Collection: ", isCollection);

        if (isCollection != -1) {
          // console.log("Collection found: ", tryArr[i]);

          theCollection = tryArr[i];
        } else {
          continue;
        }
      }
      resolve(theCollection);
    }).catch((error) => {
      console.log(error);
    });
  });
}

async function findPendingMessage(dbId, searchFilter) {
  PersonalConn = PersonalDB(dbId);

  const PendingMessagesModel = PersonalConn.model(
    "PendingMessages",
    pendingMessagesSchema
  );

  const pendingMessage = await PendingMessagesModel.findOne(searchFilter);

  return pendingMessage;
}

async function findPendingMessages(dbId, searchFilter) {
  PersonalConn = PersonalDB(dbId);

  const PendingMessagesModel = PersonalConn.model(
    "PendingMessages",
    pendingMessagesSchema
  );

  const pendingMessages = await PendingMessagesModel.find(searchFilter);

  return pendingMessages;
}

module.exports.FindAllOrganization = findAllOrganization;
module.exports.FindOneOrganization = findOneOrganization;
module.exports.FindAllOrganizationUsers = findAllOrganizationUsers;
module.exports.FindOneOrganizationUser = findOneOrganizationUser;
module.exports.FindAllPersonalUsers = findAllPersonalUsers;
module.exports.FindOnePersonalUser = findOnePersonalUser;
module.exports.FindUserInGroup = findUserInGroup;
module.exports.FindGroups = findGroups;
module.exports.FindGroupChat = findGroupChat;
module.exports.FindUserChat = findUserChat;
module.exports.FindCollections = findCollections;
module.exports.FindPendingMessage = findPendingMessage;
module.exports.FindPendingMessages = findPendingMessages;
module.exports.FindUserChatSorted = findUserChatSorted;
module.exports.FindGroupChatSorted = findGroupChatSorted;
