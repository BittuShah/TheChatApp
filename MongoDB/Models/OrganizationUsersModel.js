const mongoose = require("mongoose");

const { MasterDB } = require("../../startup/db");

const MasterConn = MasterDB();

// Helper External
const moment = require("moment");

const OrganizaionUserSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: false,
  },
  ProfileUrl: {
    type: String,
    required: false,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    min: 7,
  },
  Password: {
    type: String,
    required: true,
    min: 7,
  },
  UserName: {
    type: String,
    required: true,
    unique: true,
  },
  CountryCode: {
    type: String,
    required: true,
  },
  MobileNo: {
    type: String,
    required: true,
    min: 13,
    max: 13,
  },
  LastSeen: {
    type: Date,
    required: true,
    default: new Date(),
  },
  isActivated: {
    type: Boolean,
    required: true,
  },
  isAuthorized: {
    type: Boolean,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  CustomerId: {
    type: String,
    required: true,
  },
});

module.exports = MasterConn.model("OrganizationUsers", OrganizaionUserSchema);
// module.exports = mongoose.model("OrganizationUsers", OrganizaionAdminSchema);
