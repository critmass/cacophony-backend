"use strict";

/** Routes for memberships. */

const jsonschema = require("jsonschema");

const Membership = require("../database_models/Membership");
const newMembershipSchema = require("../json_schema/membershipNew.json")
const updateMemebershipSchema = require("../json_schema/membershipUpdate.json")
const { BadRequestError, UnauthorizedError } = require("../expressError");

/** POST / {userId, roleId, nickname, pictureUrl} => {
 *              membership:{
 *                server_id,
 *                membership:{
 *                    member_id
 *                    user_id,
 *                    role:{
 *                        id,
 *                        title,
 *                        color,
 *                        is_admin,
 *                        access:[
 *                          { room_id, read_only, is_moderator }
 *                        , ...]
 *                    },
 *                    nickname,
 *                    join_date,
 *                    picture_url
 *                }
 *            }}
 * */

const createMembership = async (req, res, next) => {

    try {
        console.log(req.body)
        const validator = jsonschema.validate(
            req.body, newMembershipSchema
        )

        if(!validator.valid) throw new BadRequestError(validator.errors)

        const serverId = parseInt(req.params.serverId, 10)
        const membership = await Membership.create(
                {...req.body, serverId})

        return res.status(201).json({membership})

    } catch (err) {
        next(err)
    }

}

/** GET / => {server_id, members:[{
 *                          id,
 *                          role:{
 *                              id,
 *                              title,
 *                              color
 *                          },
 *                          nickname,
 *                          picture_url
 *                      }, ...]
 *          }
 * */

const getMembers = async (req, res, next) => {
    try {
        const {serverId} = req.params
        const members = await Membership.findByServer(serverId)
        return res.status(200).json({server_id:serverId, members})
    } catch (err) {
        next(err)
    }
}

/** GET /[memberId] => {
 *              membership:{
 *                  id,
 *                  server_id,
 *                  nickname,
 *                  picture_url,
 *                  role:{
 *                      id,
 *                      title,
 *                      color,
 *                      is_admin
 *                      access:[{
 *                          room_name,
 *                          room_id,
 *                          read_only,
 *                          is_moderator
 *                      }, ...]
 *                  }
 *              }
 *          }
 * */

const getMembership = async (req, res, next) => {
    try {
        const membership = await Membership.get(req.params.memberId)
        return res.status(200).json({membership})
    } catch (err) {
        next(err)
    }
}

/** PATCH /[memberId] { nickname, roleId } => {
 *                          membership:{
 *                                      id,
 *                                      server_id,
 *                                      nickname,
 *                                      picture_url,
 *                                      role:{
 *                                          role_id,
 *                                          title,
 *                                          color,
 *                                          is_admin
 *                                          access:[{
 *                                              room_name,
 *                                              room_id,
 *                                              read_only,
 *                                              is_moderator
 *                                          }, ...]
 *                                      }
 *                          }
 *                      }
 * */

const patchMembership = async (req, res, next) => {
    try {
        const validator = jsonschema.validate(
                                        req.body, updateMemebershipSchema)
        if(!validator.valid) throw new BadRequestError()

        const {memberId, serverId} = req.params
        const member = res.locals.user.memberships.find( membership => {
            if(membership.server_id === parseInt(serverId)) {
                return membership
            }
        })
        if(req.body.roleId !== undefined && !member.is_admin) {
            throw new UnauthorizedError(
                "you must be an admin to change role")
        }
        const membership = await Membership.update(memberId, req.body)

        return res.status(201).json({membership})
    } catch (err) {
        next(err)
    }
}

/** DELETE /[member_id] => {
 *                  membership:{
 *                      id,
 *                      server_id,
 *                      user_id,
 *                      nickname,
 *                      role_id
 *                  }
 *              }
 * */

const deleteMembership = async (req, res, next) => {
    try {
        const {memberId} = req.params
        const membership = await Membership.remove(memberId)
        res.status(201).json({membership})
    } catch (err) {
        next(err)
    }
}

module.exports = {
                createMembership,
                getMembers,
                getMembership,
                patchMembership,
                deleteMembership
            }