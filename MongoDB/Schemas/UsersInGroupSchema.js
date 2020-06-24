const mongoose = require("mongoose");

const userInGroupSchema = new mongoose.Schema({
  GroupId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  UserId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  isActivated: {
    type: Boolean,
    required: true,
  },
  isAuthorized: {
    type: Boolean,
    required: true,
  },
});

module.exports = userInGroupSchema;
