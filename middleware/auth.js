"use strict";

/** Convenience middleware to handle common auth cases in routes.
 * authenticateJWT and ensureLoggedIn are pulled from express-Jobly
 * project.
*/

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const Membership = require("../database_models/Membership");
const Role = require("../database_models/Role");
const { UnauthorizedError, NotFoundError, ForbiddenError} = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

const ensureLoggedIn = (req, res, next) => {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

const ensureIsSiteAdmin = (req, res, next) => {
  try {
    if (!res.locals.user || !res.locals.user.is_site_admin) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

const ensureIsCurrentUser = (req, res, next) => {
  try {
    const user = res.locals.user;
    if(user) {
      if( user.id === req.params.id) {
        return next()
      }
    }
    throw new UnauthorizedError()
  } catch (err) {
    return next(err);
  }
}

const ensureSiteAdminOrCurrentUser = (req, res, next) => {
  try {

    const user = res.locals.user;

    if(user) {
      if(
        user.is_site_admin ||
        user.id === parseInt(req.params.userId,10)
      ) return next()
    }
    throw new UnauthorizedError();

  } catch (err) {
    return next(err);
  }

}

const ensureIsServerMember = (req, res, next ) => {
  try {
    const serverId = parseInt(req.params.serverId, 10)
    const membership = res.locals.user.memberships.find(member => {
      if(member.server_id === serverId) return member
    })
    if(membership) return next()
    else throw new UnauthorizedError("not a member of this server")

  } catch (err) {
    next(err)
  }
}

const ensureIsServerAdmin = (req, res, next) => {
  try {
    const memberships = res.locals.user.memberships
    const serverId = parseInt(req.params.serverId, 10)
    const member = memberships.find( membership => {
      if(membership.server_id === serverId) return membership
    })
    if(!member || !member.is_admin){
      throw new UnauthorizedError("unathorized, not an admin")
    }
    return next()
  } catch (err) {
    next(err)
  }
}

const ensureIsServerAdminOrCurrentUser = (req, res, next) => {
  try {
    const memberships = res.locals.user.memberships
    const serverId = parseInt(req.params.serverId, 10)
    const member = memberships.find(membership => {
      if (membership.server_id === serverId) return membership
    })
    if (member) {
      if(member.is_admin) return next()
      else if(parseInt(req.params.memberId, 10) === member.id) {
        return next()
      }
    }
    throw new UnauthorizedError("unathorized, not an admin")
  } catch (err) {
    next(err)
  }
}

const ensureIsMemberOrSiteAdmin = (req, res, next) => {
  try {
    const memberships = res.locals.user.memberships
    const serverId = parseInt(req.params.serverId, 10)
    const member = memberships.find(membership => {
      if (membership.server_id === serverId) return membership
    })
    if (member || res.locals.user.is_site_admin) {
      return next()
    }
    throw new UnauthorizedError("unathorized, not an admin")
  } catch (err) {
    next(err)
  }
}

const ensureIsServerOrSiteAdmin = (req, res, next) => {
  try {
    if(res.locals.user.is_site_admin) return next()
    const memberships = res.locals.user.memberships
    const serverId = parseInt(req.params.serverId, 10)
    const member = memberships.find(membership => {
      if (membership.server_id === serverId) return membership
    })
    if (!member || !member.is_admin) {
      throw new UnauthorizedError("unathorized, not an admin")
    }
    return next()
  } catch (err) {
    next(err)
  }
}


module.exports = {
  ensureLoggedIn,
  authenticateJWT,
  ensureIsSiteAdmin,
  ensureIsCurrentUser,
  ensureIsServerAdmin,
  ensureIsServerMember,
  ensureIsMemberOrSiteAdmin,
  ensureIsServerOrSiteAdmin,
  ensureSiteAdminOrCurrentUser,
  ensureIsServerAdminOrCurrentUser
};
