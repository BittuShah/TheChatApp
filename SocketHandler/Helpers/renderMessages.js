const mongoose = require("mongoose");

// Utility Functions
const { FormatMessage } = require("../../utils/messages");

// Helper Functions
const {
  FindOneOrganizationUser,
  FindOnePersonalUser,
  FindPendingMessage,
} = require("../../MongoDB/Helpers/findingHelper");

async function renderMessages(
  socket,
  Messages,
  dbId,
  senderId = "",
  receiverId = ""
) {
  for (let i = 0; i < Messages.length; i++) {
    const getUser = await FindOnePersonalUser(dbId, {
      _id: mongoose.Types.ObjectId(Messages[i].From),
    });

    const getName = await FindOneOrganizationUser({ _id: getUser.UserId });

    let isDelivered = true,
      isSeen = true;
    let isSender = false;

    if (Messages[i].From == senderId) {
      isSender = true;
    }

    if (senderId && receiverId) {
      const pendingMessage = await FindPendingMessage(dbId, {
        MessageId: Messages[i]._id,
        SenderId: senderId,
        ReceiverId: receiverId,
      });

      // let isDelivered;

      if (pendingMessage) {
        isSeen = false;
        if (pendingMessage.isDelivered) {
          isDelivered = true;
        } else {
          isDelivered = false;
        }
      } else {
        isSeen = true;
        isDelivered = true;
      }
    }

    socket.emit(
      "message",
      FormatMessage(
        Messages[i]._id,
        getName.Name,
        Messages[i].Message,
        Messages[i].CreatedAt,
        isSeen,
        isDelivered,
        isSender
      )
    );
  }
}

module.exports.RenderMessages = renderMessages;
