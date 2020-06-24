const jwt = require("jsonwebtoken");

function convertJWTToken(token) {
  try {
    const converted = jwt.verify(token, process.env.TOKEN_SECRET_DEV);
    return converted;
  } catch (error) {
    console.log(error);
  }
}

module.exports = convertJWTToken;
