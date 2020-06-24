const mongoose = require("mongoose");

const pendingMessagesSchema = new mongoose.Schema({
  SenderId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  ReceiverId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  MessageId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  isDelivered: {
    type: Boolean,
    required: true,
  },
});

module.exports = pendingMessagesSchema;
