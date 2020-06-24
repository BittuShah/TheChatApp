const mongoose = require("mongoose");

const userChat = mongoose.Schema({
  From: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  To: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  Url: {
    type: String,
    required: false,
  },
  Info: {
    type: String,
    required: false,
  },
  Message: {
    type: String,
    required: false,
  },
  CreatedAt: {
    type: Date,
    required: true,
  },
});

module.exports = userChat;
