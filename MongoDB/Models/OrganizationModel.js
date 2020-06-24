const mongoose = require("mongoose");
const { MasterDB } = require("../../startup/db");

const MasterConn = MasterDB();

const organizationSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  City: {
    type: String,
    required: true,
  },
  State: {
    type: String,
    required: true,
  },
  Country: {
    type: String,
    required: true,
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
  Description: {
    type: String,
    required: true,
  },
  TypeOfOrganization: {
    type: String,
    required: true,
  },
  OrganizationEmail: {
    type: String,
    required: true,
    min: 7,
  },
  UsersCredit: {
    type: Number,
    required: true,
  },
  CurrentNoOfUsers: {
    type: Number,
    required: true,
  },
  GroupsCredit: {
    type: Number,
    required: true,
  },
  CurrentNoOfGroups: {
    type: Number,
    required: true,
  },
  RegistrationType: {
    type: String,
    required: true,
  },
  LogoUrl: {
    type: String,
    required: false,
  },
  Admin: {
    Name: {
      type: String,
      required: true,
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
    CountryCode: {
      type: String,
      require: true,
    },
    MobileNo: {
      type: String,
      required: true,
      min: 13,
      max: 13,
    },
    Password: {
      type: String,
      required: true,
      min: 8,
    },
    UserName: {
      type: String,
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
  },
});

module.exports = MasterConn.model("Organization", organizationSchema);
