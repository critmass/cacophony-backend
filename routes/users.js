"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {
    ensureLoggedIn,
    ensureIsSiteAdmin,
    ensureSiteAdminOrCurrentUser
} = require("../middleware/auth");
const {
    BadRequestError,
    NotFoundError
} = require("../expressError");
const jwt = require("jsonwebtoken")
const userNewSchema = require("../json_schema/userNew.json");
const userUpdateSchema = require("../json_schema/userUpdate.json");
const User = require("../database_models/user");

const router = express.Router();

/** POST / {
 *          username,
 *          pictureUrl
 *          } => {
 *                  user:{
 *                          id,
 *                          username,
 *                          picture_url,
 *                          joining_date,
 *                          is_site_admin
 *                      }
 *                  }
 *
 * Add a new user
*/

router.post("/", ensureIsSiteAdmin, async (req, res, next) => {

    try{
        const validator = jsonschema.validate(req.body, userNewSchema)
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);

            throw new BadRequestError(errs);
        }

        const user = await User.create(req.body)

        return res.status(201).json({user})
    }
    catch(err) {
        return next(err)
    }

})

/** GET / => {users:[{id, username, picture_url, last_on},...]} */

router.get("/", ensureLoggedIn, async (req, res, next) => {

    try{
        const users = await User.findAll()
        if(!users.length) throw new NotFoundError("no users")
        else res.status(200).json({users})
    } catch(err){
        return next(err)
    }
})

/** GET /[userId] => {user:{
 *                      id,
 *                      username,
 *                      picture_url,
 *                      joining_date,
 *                      last_on,
 *                      is_site_admin,
 *                      memberships:[{
 *                          membership_id,
 *                          nickname,
 *                          role:{id, title, color},
 *                          server:{id, name, picture_url}
 *                      }, ...]
 *                  }}
 * */

router.get("/:userId", ensureSiteAdminOrCurrentUser, async (req, res, next) => {

    try {
        const user = await User.get(req.params.userId)

        if(!user.id) throw new NotFoundError("no user found")

        return res.status(200).json({user})

    } catch (err) {
        return next(err)
    }
})

/** PATCH /[userId] {user} => {user}
*/

router.patch(
    "/:userId",
    ensureSiteAdminOrCurrentUser,
    async (req, res, next) => {

        try {
            const validator = jsonschema.validate(
                                            req.body,
                                            userUpdateSchema)

            if(!validator.valid) throw new BadRequestError()

            /**
             * this is to ensure that only a current site admin
             * can update a user's site admin status
             * */

            const isSiteAdmin = res.locals.user.isSiteAdmin ?
                                    req.body.isSiteAdmin :
                                    null

            const user = await User.update({
                                    ...req.body,
                                    isSiteAdmin,
                                    id:parseInt(req.params.userId, 10)
            })

            return res.status(201).json({user})
        }
        catch (err) {
            next(err)
        }
})

/** DELETE /[userId] => {user:{
 *                              id,
 *                              username,
 *                              picture_url,
 *                              joining_date,
 *                              last_on
 *                      }}
 * */

router.delete(
    "/:userId",
    ensureSiteAdminOrCurrentUser,
    async (req, res, next) => {

        try {
            const user = await User.remove(req.params.userId)
            return res.status(200).json({user})
        } catch (error) {
            next(error)
        }
})

module.exports = router