"use strict";

/** Routes for memberships. */

const jsonschema = require("jsonschema");

const Server = require("../database_models/Server");
const Role = require("../database_models/Role");
const Membership = require("../database_models/Membership");
const Room = require("../database_models/Room");

const express = require("express")
const router = express.Router();
const { BadRequestError } = require("../expressError");
const {
    createRoom,
    getRooms,
    getRoom,
    patchRoom,
    deleteRoom
} = require("../services/rooms");
const {
    createRole,
    getRoles,
    getRole,
    patchRole,
    deleteRole
} = require("../services/roles");
const {
    createMembership,
    getMembers,
    getMembership,
    patchMembership,
    deleteMembership
} = require("../services/memberships");
const {
    ensureLoggedIn,
    ensureIsMemberOrSiteAdmin,
    ensureIsServerAdmin,
    ensureIsServerOrSiteAdmin,
    ensureIsServerMember,
    ensureIsServerAdminOrCurrentUser
} = require("../middleware/auth");
const {
    createPost,
    getPost,
    getPosts,
    updatePost,
    removePost
} = require("../services/posts")

const serverNewSchema = require("../json_schema/serverNew.json")
const serverUpdateSchema = require("../json_schema/serverUpdate.json");
const {
    isRoomOnServer,
    isRoleOnServer,
    doesServerExist,
    isMembershipOnServer
} = require("../middleware/structure");
const { intToColor } = require("../helpers/colorConverter");


/** POST / {
 *          serverName,
 *          pictureUrl
 *          } => {  membership:{
 *                         id,
 *                         user_id,
 *                         nickname,
 *                         joining_date,
 *                         role:{
 *                                 id,
 *                                 is_admin,
 *                                 title,
 *                                 color
 *                         },
 *                         server_id,
 *                         picture_url
 *                  }
 *                  server:{
 *                         id,
 *                         name,
 *                         picture_url,
 *                         start_date,
 *                         members:[
 *                              id,
 *                              user_id,
 *                              nickname,
 *                              joining_date,
 *                              role:{
 *                                 id,
 *                                 is_admin,
 *                                 title,
 *                                 color
 *                              },
 *                              server_id,
 *                              picture_url
 *                         ]
 *                         roles:[{id, title, color, is_admin}, ...]
 *                         rooms:[{id, name, type}]
 *                  }
 *              }
 * */

router.post("/", ensureLoggedIn, async (req, res, next) => {

    try {
        const validator = jsonschema.validate(req.body, serverNewSchema)
        if(!validator.valid) {
            const errs = validator.errors.map( e => e.stack )
            throw new BadRequestError(errs)
        }
        const server = await Server.create(req.body)
        const adminRole = await Role.create(
            {title:"admin" , serverId:server.id, isAdmin:true })
        const memberRole = await Role.create(
            {title:"member", serverId:server.id, isAdmin:false})
        const membership = await Membership.create({
            userId:res.locals.user.id,
            roleId:adminRole.id,
            serverId:server.id
        })
        const room = await Room.create(
                                {name:"Main Room", serverId:server.id})
        await Role.addAccess(adminRole.id, room.id, true)
        const data = {
                server: {
                    ...server,
                    members:[membership],
                    roles: [adminRole, memberRole],
                    rooms: [room]
                }
        }
        return res.status(201).json(data)

    } catch (err) {
        next(err)
    }
})

/** GET / => {servers:[{
 *                      id,
 *                      name,
 *                      picture_url,
 *                      start_date,
 *                      number_of_members
 *              },...]
 *          }
 * */

router.get("/", ensureLoggedIn, async (req, res, next) => {

    try {
        const servers = await Server.findAll()
        return res.status(200).json({servers})
    } catch (err) {
        next(err)
    }
})

/** GET /[serverId] => {server:{
 *                         id,
 *                         name,
 *                         picture_url,
 *                         start_date,
 *                         members:[{
 *                              id,
 *                              nickname,
 *                              role:{
 *                                  id,
 *                                  title,
 *                                  color,
 *                                  is_admin
 *                              },
 *                              picture_url,
 *                              joining_date
 *                          }, ...],
 *                         roles:[{id, title, color:{r,b,g}}],
 *                         rooms:[{id, name, type}, ...]
 *                     }}
 * */

router.get("/:serverId",
    doesServerExist,
    ensureIsMemberOrSiteAdmin,
    async (req, res, next) => {
        try {
            const serverInfo = await Server.get(req.params.serverId)
            const roleMap = serverInfo.roles.reduce( (map, role) => {
                map.set(
                    role.id, {
                        ...role,
                        color:intToColor(role.color)
                    }
                )
                return map
            }, new Map())
            const server = {
                id:serverInfo.id,
                name:serverInfo.name,
                picture_url:serverInfo.picture_url,
                members:serverInfo.members.map( member => {
                    return {
                        id:member.id,
                        user_id:member.user_id,
                        nickname:member.nickname,
                        role:roleMap.get(member.role_id),
                        picture_url:member.picture_url,
                        joining_date:member.joining_date
                    }
                }),
                roles:[...roleMap.values()],
                rooms:serverInfo.rooms
            }

            return res.status(200).json({server})
        } catch (err) {
            next(err)
        }
})

/** PATCH /[serverId] {
 *                      name,
 *                      picture_url
 *                  } => {server:{
 *                          id,
 *                          name,
 *                          picture_url,
 *                          start_date
 *                     }}
 * */

router.patch("/:serverId",
    doesServerExist,
    ensureIsServerAdmin,
    async (req, res, next) => {
        try {
            const validator = jsonschema.validate(
                                            req.body, serverUpdateSchema)
            if(!validator.valid) throw new BadRequestError()

            const server = await Server.update(req.params.serverId, req.body)
            return res.status(201).json({server})
        } catch (err) {
            next(err)
        }
})

/** DELETE /[serverId] => {server:{
 *                              id,
 *                              name,
 *                              picture_url,
 *                              start_date,
 *                              end_date
 *                          }}
 * */

router.delete("/:serverId",
    doesServerExist,
    ensureIsServerOrSiteAdmin,
    async (req, res, next) => {
        try {
            const server = await Server.delete(req.params.serverId)
            return res.status(201).json({server})
        } catch (err) {
            next(err)
        }
})

// posts routes
router.post("/:serverId/rooms/:roomId/posts",
    doesServerExist, isRoomOnServer, ensureIsServerMember, createPost)
router.get("/:serverId/rooms/:roomId/posts",
    doesServerExist, isRoomOnServer, ensureIsServerMember, getPosts)
router.get("/:serverId/rooms/:roomId/posts/:postId",
    doesServerExist, isRoomOnServer, ensureIsServerMember, getPost)
router.patch("/:serverId/rooms/:roomId/posts/:postId",
    doesServerExist, isRoomOnServer, ensureIsServerMember, updatePost)
router.delete("/:serverId/rooms/:roomId/posts/:postId",
    doesServerExist, isRoomOnServer, ensureIsServerMember, removePost)


// rooms routes
router.post("/:serverId/rooms",
    doesServerExist, ensureIsServerAdmin, createRoom)
router.get("/:serverId/rooms",
    doesServerExist, ensureIsServerMember, getRooms)
router.get("/:serverId/rooms/:roomId",
    doesServerExist, isRoomOnServer, ensureIsServerMember, getRoom)
router.patch("/:serverId/rooms/:roomId",
    doesServerExist, isRoomOnServer, ensureIsServerAdmin, patchRoom)
router.delete("/:serverId/rooms/:roomId",
    doesServerExist, isRoomOnServer, ensureIsServerAdmin, deleteRoom)

// roles routes
router.post("/:serverId/roles",
    doesServerExist, ensureIsServerAdmin, createRole)
router.get("/:serverId/roles",
    doesServerExist, ensureIsServerMember, getRoles)
router.get("/:serverId/roles/:roleId",
    doesServerExist, isRoleOnServer, ensureIsServerAdmin, getRole)
router.patch("/:serverId/roles/:roleId",
    doesServerExist, isRoleOnServer, ensureIsServerAdmin, patchRole)
router.delete("/:serverId/roles/:roleId",
    doesServerExist, isRoleOnServer, ensureIsServerAdmin, deleteRole)

// members routes
router.post("/:serverId/members",
    doesServerExist,
    ensureIsServerAdmin,
    createMembership
)
router.get("/:serverId/members",
    doesServerExist,
    ensureIsMemberOrSiteAdmin,
    getMembers
)
router.get("/:serverId/members/:memberId",
    doesServerExist,
    isMembershipOnServer,
    ensureIsServerMember,
    getMembership
)
router.patch("/:serverId/members/:memberId",
    doesServerExist,
    isMembershipOnServer,
    ensureIsServerAdminOrCurrentUser,
    patchMembership
)
router.delete("/:serverId/members/:memberId",
    doesServerExist,
    isMembershipOnServer,
    ensureIsServerAdminOrCurrentUser,
    deleteMembership
)

module.exports = router