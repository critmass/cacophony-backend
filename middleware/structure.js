const Membership = require("../database_models/Membership")
const Role = require("../database_models/Role")
const Room = require("../database_models/Room")
const Server = require("../database_models/Server")
const { NotFoundError, ForbiddenError } = require("../expressError")

const doesServerExist = async (req, res, next) => {
    try {
        const { serverId } = req.params
        const server = await Server.get(serverId)
        if(!server) throw new NotFoundError("server not found")
        return next()
    } catch (err) {
        next(err)
    }
}

const isRoleOnServer = async (req, res, next) => {
    try {
        const {server_id} = await Role.get(req.params.roleId)
        if(server_id) {
            const serverId = parseInt(req.params.serverId, 10)
            if(serverId === server_id) return next()
            else throw new ForbiddenError("role is not on server")
        }
        else throw new NotFoundError("role doesn't exist")
    } catch (err) {
        next(err)
    }
}

const isRoomOnServer = async (req, res, next) => {
    try {
        const {server_id} = await Room.get(req.params.roomId)
        if(server_id) {
            const serverId = parseInt(req.params.serverId, 10)
            if(serverId === server_id) return next()
            else throw new ForbiddenError("room is not on server")
        }
        else throw new NotFoundError("room doesn't exist")
    } catch (err) {
        next(err)
    }
}

const isMembershipOnServer = async (req, res, next) => {
    try {
        const {server_id} = await Membership.get(req.params.memberId)
        if(server_id) {
            const serverId = parseInt(req.params.serverId, 10)
            if(serverId === server_id) return next()
            else throw new ForbiddenError("membership is not on server")
        }
        else throw new NotFoundError("membership doesn't exist")
    } catch (err) {
        next(err)
    }
}

module.exports = {
    doesServerExist,
    isRoleOnServer,
    isRoomOnServer,
    isMembershipOnServer
}