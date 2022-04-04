"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { intToColor, colorToInt } = require("../helpers/colorConverter");
const { sqlForPartialUpdate } = require("../helpers/sql");

const defaultColor = {r:255, b:255, g:255}

class Role {

    /** Creates a new role based on data
     *
     * data should be {title, serverId, color}
     *
     * returns {id, title, server_id, color}
     */

    static async create({title, serverId, color=defaultColor, isAdmin=false}) {

        const colorSQL = colorToInt(color)

        const result = await db.query(`
                INSERT INTO roles (
                    title, server_id, color, is_admin
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, server_id, color
        `,[title, serverId, colorSQL, isAdmin])

        return {
            ...result.rows[0],
            color:intToColor(result.rows[0].color)
        }
    };

    /** Finds all roles on server
     * returns [{
     *              id,
     *              title,
     *              server_id,
     *              color:{r, b, g},
     *              is_admin
     *          }, ...]
     */

    static async find(serverId) {

        const result = await db.query(`
                SELECT
                    id,
                    title,
                    server_id,
                    color,
                    is_admin
                FROM roles
                WHERE server_id = $1
        `, [serverId])

        return result.rows.map( row => {

            return {...row, color:intToColor(row.color)}
        })
    };

    /** Given an id returns a role
     *
     * returns {
     *              id,
     *              title,
     *              server_id,
     *              color:{r, b, g},
     *              is_admin,
     *              members:[{id, nickname, picture_url}, ...],
     *              access:[{room_id, room_name, type}, ...]
     *          }
     */

    static async get(id) {

        const result = await db.query(`
                SELECT
                    r.id AS "id",
                    r.title AS "title",
                    r.server_id AS "server_id",
                    r.color AS "color",
                    r.is_admin AS "is_admin",
                    m.id AS "member_id",
                    m.nickname AS "nickname",
                    m.picture_url AS "picture_url",
                    a.room_id AS "room_id",
                    a.is_moderator AS "is_moderator",
                    room.name AS "room_name",
                    room.type AS "room_type"
                FROM roles r
                LEFT JOIN memberships m ON r.id = m.role_id
                LEFT JOIN access a ON a.role_id = r.id
                LEFT JOIN rooms room ON room.id = a.room_id
                WHERE r.id = $1
        `, [id])

        if(!result.rows.length) throw new NotFoundError("role not found")

        const roleInfo = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            server_id: result.rows[0].server_id,
            color: intToColor(result.rows[0].color),
            is_admin: result.rows[0].is_admin
        }

        const members = result.rows.reduce((memberMap, row) => {

            memberMap.set(row.member_id, {
                id: row.member_id,
                nickname: row.nickname,
                picture_url: row.picture_url
            })

            return memberMap
        }, new Map())

        const access = result.rows.reduce((accessMap, row) => {

            accessMap.set(row.room_id, {
                room_id: row.room_id,
                name: row.room_name,
                type: row.room_type,
                is_moderator: row.is_moderator
            })

            return accessMap
        }, new Map())

        const role =  {
            ...roleInfo,
            members:[...members.values()],
            access:[...access.values()]
        }

        return role
    };

    /** Updates a role based of data
     *
     * data should be {id, {title, color, isAdmin}}
     *
     * returns { id, title, server_id, color, is_admin }
     */

    static async update(id, data) {

        let color = colorToInt(data.color)
        const title = data.title
        const isAdmin = data.isAdmin

        const {setCols, values} = sqlForPartialUpdate(
            {id, title, color, isAdmin}, {
            id:"id",
            title:"title",
            color:"color",
            isAdmin:"is_admin"
        })

        const result = await db.query(`
                UPDATE roles
                SET ${setCols}
                WHERE id = $1
                RETURNING
                    id, title, server_id, color, is_admin
        `, [...values])

        if(!result.rows.length) throw new NotFoundError()

        color = intToColor(result.rows[0].color)

        return {...result.rows[0], color}
    };

    /** Adds access to a room to a role
     *
     * data should be {id, roomId, isModerator}
     *
     * returns {role_id, room_id, is_moderator}
     */

    static async addAccess(id, roomId, isModerator=false) {

        const result = await db.query(`
                INSERT INTO access (
                    role_id, room_id, is_moderator
                )
                VALUES ( $1, $2, $3 )
                RETURNING role_id, room_id, is_moderator
        `,[id, roomId, isModerator])

        if(!result.rows[0].role_id) throw new NotFoundError()

        return {...result.rows[0]}
    };

    /** Removes room access from role
     *
     * returns undefined
     *
     * throws error if id doesn't exist
     *
     * throws error if roomId doesn't exist
     */

    static async removeAccess(id, roomId) {

        const result = await db.query(`
                DELETE FROM access
                WHERE role_id = $1 AND room_id = $2
                RETURNING role_id
        `, [id, roomId])

        if( !result.rows[0] ){
            throw new NotFoundError("role doesn't have access to this room")
        }
    };

    /** changes moderator status for a role in a room
     *
     * data should be {id, roomId, isModerator}
     *
     * If isModerator is null, toggles isModerator to
     * the oppisite of current setting
     *
     * returns {role_id, room_id, is_moderator}
     *
     * throws error if role doesn't have access to
     */

    static async changeModeratorStatus(id, roomId, isModerator=null) {

        if(isModerator === null) {
            const result = await db.query(`
                    SELECT is_moderator FROM access
                    WHERE role_id = $1 AND room_id = $2
            `, [id, roomId])

            isModerator = !result.rows[0].is_moderator
        }

        const result = await db.query(`
                UPDATE access SET is_moderator = $3
                WHERE role_id = $1 AND room_id = $2
                RETURNING
                    role_id,
                    room_id,
                    is_moderator
        `, [id, roomId, isModerator])

        if(!result.rows[0].role_id) throw new NotFoundError()

        return {...result.rows[0]}
    };

    /** Removes role
     *
     * returns {
     *              title,
     *              server_id,
     *              is_admin,
     *              color:{r, b, g}
     *          }
     *
     * throws an error if role is not found
     *
     * throws an error if members still belong to role
     */

    static async remove(id) {

        const memberResult = await db.query(`
                SELECT id FROM memberships
                WHERE role_id = $1
        `, [id])

        if(memberResult.rows[0]){
            throw new BadRequestError("Members still belong to this role")
        }

        await db.query(`
                DELETE FROM access
                WHERE role_id = $1
        `, [id])

        const result = await db.query(`
                DELETE FROM roles
                WHERE id = $1
                RETURNING title, server_id, is_admin, color
        `, [id])

        return {...result.rows[0], color:intToColor(result.rows[0].color)}
    };
}

module.exports = Role