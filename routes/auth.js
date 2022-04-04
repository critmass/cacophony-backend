"use strict";

/** Routes for authentication. */

// this was heavily borrowed from the Jobly project

const jsonschema = require("jsonschema");

const User = require("../database_models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../json_schema/userAuth.json");
const userRegisterSchema = require("../json_schema/userRegister.json")
const { BadRequestError } = require("../expressError");
const { authenticateJWT } = require("../middleware/auth");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { username, password } = req.body;
        const user = await User.authenticate(username, password);

        const token = createToken(user);
        await User.updateLastOn(user.id)

        return res.status(200).json({ token });

    } catch(err) {
        return next(err)
    }
})
/** GET /auth/update: => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: user
 */

router.get("/update", authenticateJWT, async (req, res, next) => {
    try {
        console.log(res.locals)
        const userId = res.locals.user.id

        const user = await User.get(userId);
        const formatedUser = {
            id:user.id,
            username:user.username,
            is_site_admin:user.is_site_admin,
            memberships:user.memberships.map( membership => {
                return {
                    id: membership.id,
                    server_id: membership.server.id,
                    role_id: membership.role.id,
                    is_admin: membership.role.is_admin
                }
            })
        }

        await User.updateLastOn(user.id)
        const token = createToken(formatedUser);

        return res.status(200).json({ token });

    } catch(err) {
        return next(err)
    }
})

/** POST /auth/register:   { user } => { token, user_id }
 *
 * user must include { username, password }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
    try {
        console.info(req.body)
        const validator = jsonschema.validate(
                                        req.body,
                                        userRegisterSchema );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const newUser = await User.create(req.body);
        const token = createToken(newUser);

        return res.status(201).json({ token, user_id:newUser.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router