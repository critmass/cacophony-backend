/** Chat rooms that can be joined/left/broadcast to. */

const RoomDatabase = require("../database_models/Room");
const { UnauthorizedError } = require("../expressError");

// in-memory storage of roomId -> room

const ROOMS = new Map();

/** Room is a collection of listening members; this becomes a "chat room"
 * where individual users can join/leave/broadcast to.  When the first
 * member joins a room it is added to the ROOMS map.  When the last member
 * of a room leaves it is removed from the ROOMS map.
 */

class Room {

    /** get room by id, if the room is not in memory, pulls it from the
     * database and adds it to the Map. If the room is not in the database
     * it will throw an error. Use this method only for websocket calls,
     * so that a member can be added immediately.  This is because members
     * joining and leaving is used for garbage collection purposes.  If you
     * need information about a room, use a the database_model calls or
     * http routes.
     */

    static async get (roomId) {
        if(!ROOMS.has(roomId)) {
            const roomData = await RoomDatabase.get(roomId)
            ROOMS.set(roomId, new Room(roomData))
        }

        return ROOMS.get(roomId)
    }

    static async update(roomId, roomData) {
        if(ROOMS.has(roomId)) {
            ROOMS.get(roomId).name = roomData.name
        }
    }

    /** creates a new instance of the Room object with a map of accepted
     * members by id.  If the roomId isn't in the database it throws an
     * error.
     * */

    constructor (roomData) {

        this.posts = roomData.posts
        this.id = roomData.id
        this.name = roomData.name
        this.type = roomData.type
        this.members = new Map()
        roomData.members.forEach( member => {
            this.members.set(member.id, member)
        })
        this.membersOnline = new Map()
    }

    /** member joining a room, if not on the accepted member
     * list throws an error.  If they are on the accepted member
     * list, changes the member status from offline to online.
     * */

    async join(member) {
        if(this.members.has(member.id)) {
            this.membersOnline.set(member.id, member)
        }
        throw new UnauthorizedError("not allowed")
    }

    /** member status changed from online to offline.  If the last member
     * leaves it deletes the room from ROOMS.
     */

    async leave(member) {
        this.membersOnline.delete(member.id)
    }

    /** sends the new post to everyone currently logged-in to the room. */

    async broadcast(post) {
        this.membersOnline.forEach( member => {
            member.send( JSON.stringify(post) )
        })
    }

}

module.exports = Room