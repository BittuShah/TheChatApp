const jwt = require("jsonwebtoken");
const config = require("config");

function authAdmin(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, config.get("TOKEN_SECRET_DEV"));
    req.user = verified;
    if (req.user.isAdmin == true) {
      next();
    } else {
      res.status(400).send("You are not an Admin!");
    }
  } catch (err) {
    res.status(400).send("Invalid Token!");
  }
}

function authUser(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, config.get("TOKEN_SECRET_DEV"));
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token!");
  }
}

module.exports.AuthAdmin = authAdmin;
module.exports.AuthUser = authUser;
