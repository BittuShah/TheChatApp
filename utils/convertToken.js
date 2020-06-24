const jwt = require("jsonwebtoken");
const config = require("config");

function convertJWTToken(token) {
  try {
    const converted = jwt.verify(token, config.get("TOKEN_SECRET_DEV"));
    return converted;
  } catch (error) {
    console.log(error);
  }
}

module.exports = convertJWTToken;
