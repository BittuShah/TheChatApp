// DB Connections
const { PersonalDB } = require("../../startup/db");

let PersonalConn;

// Helper Function
const { FindPendingMessages } = require("./findingHelper");

// Models and Schemas
const pendingMessagesSchemas = require("../Schemas/PendingMessagesSchema");
const userInGroupSchema = require("../Schemas/UsersInGroupSchema");

async function deletePendingMessages(dbId, filterCondition) {
  PersonalConn = PersonalDB(dbId);

  const PendingMessagesModel = PersonalConn.model(
    "PendingMessages",
    pendingMessagesSchemas
  );

  const deletedMsg = await FindPendingMessages(dbId, filterCondition);

  await PendingMessagesModel.deleteMany(filterCondition);

  return deletedMsg;
}

async function deleteUserInGroup(dbId, filterCondition) {
  PersonalConn = PersonalDB(dbId);

  const UserInGroupModel = PersonalConn.model(
    "UsersInGroup",
    userInGroupSchema
  );

  await UserInGroupModel.deleteOne(filterCondition);
}

module.exports.DeletePendingMessages = deletePendingMessages;
module.exports.DeleteUserInGroup = deleteUserInGroup;
