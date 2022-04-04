/** Functionality for chatrooms */

// Room is an abstraction of the chat channel
const DbMembership = require("../database_models/Membership")
const User = require("../database_models/User")
const Room = require("./Room")


/** RoomMember is used to connect a room to an individual user */

class RoomMember {

    /** makes a connection between the member and the room
     * stores: memberId, room, and the websocket connection
     */

    async constructor (send, roomId) {
        try {
            this.room = await Room.get(roomId)
            this._send = send
            this.self = null
        }
        catch(err) {

        }
    }

    /**
     * send msgs to this client using underlying connection-send-function
     * */

    async send(data) {
        try {
            this._send(data)
            await User.updateLastOn(this.self.user_id)
            return true
        } catch (err) {
            return false
        }
    }

    /** handle joining: add to room members */

    async handleJoin (memberId) {
        await this.room.join(this)
        this.self = await DbMembership.get(memberId)
        await User.updateLastOn(this.self.user_id)
    }

    /** handle a post: broadcast to room. */

    async handlePost(text) {

    }
}