// borrowed from jobly project

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(user.is_site_admin === undefined,
      "createToken passed user without isSiteAdmin property");

  let payload = {...user};
  if(user.is_site_admin === undefined) payload.is_site_admin = false

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
