"use strict";

/** Routes for rooms. */

const jsonschema = require("jsonschema");

const Room = require("../database_models/Room");
const { BadRequestError } = require("../expressError");
const newRoomSchema = require("../json_schema/roomNew.json")
const updateRoomSchema = require("../json_schema/roomUpdate.json")

/** POST / {name, type} => {room:{id, name, type}} */

const createRoom = async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newRoomSchema)
        if(!validator.valid) throw new BadRequestError(validator.errors)

        const {serverId} = req.params
        const room = await Room.create({...req.body, serverId})

        return res.status(201).json({room})
    } catch (err) {
        next(err)
    }
}

/** GET / => {serverId, rooms:[{id, name, type}, ...]} */

const getRooms =  async (req, res, next) => {
    try {
        const {serverId} = req.params
        const rooms = await Room.find(serverId)

        return res.status(200).json({serverId, rooms})
    } catch (err) {
        next(err)
    }
}

/** GET /[roomId] => {room:{
 *                  id,
 *                  name,
 *                  server_id,
 *                  type,
 *                  members: [{
 *                      id,
 *                      nickname,
 *                      user_id,
 *                      role_id,
 *                      is_moderator
 *                  }, ...],
 *                  posts: [{
 *                      id,
 *                      content,
 *                      poster_id,
 *                      post_date,
 *                      threaded_from,
 *                      reactions: { [type]:[member_id, ...], ...}
 *              }, ...]
 *          }
 * */

const getRoom = async (req, res, next) => {
    try {
        const {roomId} = req.params
        const room = await Room.get(roomId)
        return res.status(200).json({room})
    } catch (err) {
        next(err)
    }
}

/** PATCH /[roomId] { name } => {
 *                                  room:{
 *                                      id,
 *                                      server_id,
 *                                      name,
 *                                      type
 *                                  }
 *                              }
 * */

const patchRoom =  async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, updateRoomSchema)
        if(!validator.valid) throw new BadRequestError(validator.errors)

        const {roomId} = req.params

        const room = await Room.update(roomId, req.body)

        return res.status(201).json({room})
    } catch (err) {
        next(err)
    }
}

/** DELETE /[roomId] => {room:{
     *              name,
     *              server_id,
     *              type,
     *              posts: [{
     *                          id,
     *                          content,
     *                          poster_id,
     *                          post_date,
     *                          threaded_from,
     *                          reactions: { [type]:[member_id, ...], ...}
     *                      }, ...]
     *          }}
     * */

const deleteRoom = async (req, res, next) => {
    try {
        const {roomId} = req.params

        const room = await Room.remove(roomId)

        return res.status(201).json({room})

    } catch (err) {
        next(err)
    }
}

/** WS /[roomId] => a websocket connection to the room at roomId */

const roomWebsocket = async (ws, req, next) => { }

module.exports = {
                createRoom,
                getRoom,
                getRooms,
                patchRoom,
                deleteRoom,
                roomWebsocket
            }