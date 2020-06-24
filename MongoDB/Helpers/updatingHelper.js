//DB Connections
const { PersonalDB } = require("../../startup/db");

let PersonalConn;

//  Models and Schemas
const OrganizationUser = require("../Models/OrganizationUsersModel");
const pendingMessagesSchema = require("../Schemas/PendingMessagesSchema");
const userInGroupSchema = require("../Schemas/UsersInGroupSchema");

async function updateOrganizationUsers(filterCondition, updateValues) {
  await OrganizationUser.updateOne(filterCondition, updateValues);
}

async function updatePendingMessages(dbId, filterCondition, updateValues) {
  PersonalConn = PersonalDB(dbId);

  const PendingMessagesModel = PersonalConn.model(
    "PendingMessages",
    pendingMessagesSchema
  );

  await PendingMessagesModel.updateMany(filterCondition, updateValues);

  // await PendingMessagesModel.updateOne(filterCondition, updateValues);
}

async function updateGroupUser(dbId, filterCondition, updateValues) {
  PersonalConn = PersonalDB(dbId);

  const UserInGroupModel = PersonalConn.model(
    "UsersInGroup",
    userInGroupSchema
  );

  await UserInGroupModel.updateOne(filterCondition, updateValues);
}

module.exports.UpdateOrganizationUsers = updateOrganizationUsers;
module.exports.UpdatePendingMessages = updatePendingMessages;
module.exports.UpdateGroupUser = updateGroupUser;
