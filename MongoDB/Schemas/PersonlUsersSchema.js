const mongoose = require("mongoose");

const personalUser = new mongoose.Schema({
  UserId: {
    type: String,
    required: true,
  },
  Roles: {
    type: String,
    required: true,
  },
  Status: {
    type: Boolean,
    required: true,
  },
});

module.exports = personalUser;
