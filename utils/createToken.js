const jwt = require("jsonwebtoken");

function createJWTToken(UserId, Email, CustomerId, isAdmin, _id) {
  const token = jwt.sign(
    {
      UserId: UserId,
      Email: Email,
      CustomerId: CustomerId,
      isAdmin: isAdmin,
      _id: _id,
    },
    process.env.TOKEN_SECRET_DEV
  );

  return token;
}

module.exports.CreateJWTToken = createJWTToken;
