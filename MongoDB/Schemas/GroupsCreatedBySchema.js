const mongoose = require("mongoose");

const groupsCreatedBySchema = new mongoose.Schema({
  NameOfTheGroup: {
    type: String,
    required: true,
  },
  Details: {
    type: String,
    required: false,
  },
  NumberOfUsers: {
    type: Number,
    required: true,
  },
  LogoUrl: {
    type: String,
    required: false,
  },
  CreatedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  isDefault: {
    type: Boolean,
    required: true,
  },
  UserId: {
    type: String,
    required: true,
  },
});

module.exports = groupsCreatedBySchema;
