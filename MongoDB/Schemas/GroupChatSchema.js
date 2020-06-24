const mongoose = require("mongoose");
// const moment = require("moment");
// const moment = require("moment-timezone");

const groupChat = mongoose.Schema({
  From: {
    type: String,
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
    // default: moment().utc("+05:30").format(),
  },
});

module.exports = groupChat;
