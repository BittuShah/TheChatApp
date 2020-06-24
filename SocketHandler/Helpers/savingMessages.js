//Helper Libraries
// const { CreateChatMsg } = require("../../MongoDB/Helpers/savingHelper");

// External Libraries
const moment = require("moment");

async function saveMessage(chatModel, isGroup, From, Message, To = "") {
  let createChatObj;

  if (isGroup) {
    createChatObj = new chatModel({
      From: From,
      Message: Message,
      CreatedAt: moment().utc("+05:30").format(),
    });
  } else {
    createChatObj = new UserChatModel({
      From: From,
      To: To,
      Message: Message,
      CreatedAt: moment().utc("+05:30").format(),
    });
  }

  try {
    const savedMsg = await createChatObj.save();

    return savedMsg;
  } catch (error) {
    console.log(error);
  }
}

module.exports.SaveMessage = saveMessage;
