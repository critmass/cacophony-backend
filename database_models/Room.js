"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for rooms */

class Room {

    /** Creates a room (from data), update db, return new room data.
     *
     * data should be { name, serverId, type }
     *
     * returns { id, name, server_id, type }
     */

    static async create({name, serverId, type="text"}) {

        const result = await db.query(`
                INSERT INTO rooms (
                    name, server_id, type
                )
                VALUES ($1, $2, $3)
                RETURNING id, name, server_id, type
        `, [name, serverId, type])

        const room = result.rows[0]

        return { ...room }
    };

    /** Finds all rooms in a given server by serverId
     *
     * returns [{id, name, server_id, type}, ...]
     */

    static async find(serverId) {

        const result = await db.query(`
                SELECT id, name, server_id, type
                FROM rooms WHERE server_id = $1
        `, [serverId])

        const rooms = result.rows

        return [...rooms]
    };

    /** Given a id, returns data on a room.
     *
     * returns {
     *              id,
     *              name,
     *              server_id,
     *              type,
     *              members: [{id, user_id, role_id, is_moderator}, ...],
     *              posts: [{
     *                          id,
     *                          content,
     *                          poster_id,
     *                          post_date,
     *                          threaded_from,
     *                          reactions: { [type]:[member_id, ...], ...}
     *                      }, ...]
     *          }
    */

    static async get(id) {

        const result = await db.query(`
                SELECT
                    r.id AS "id",
                    r.name AS "name",
                    r.server_id AS "server_id",
                    r.type AS "type",
                    m.id AS "member_id",
                    m.user_id AS "user_id",
                    m.role_id AS "role_id",
                    a.is_moderator AS "is_moderator",
                    p.id AS "post_id",
                    p.content AS "content",
                    p.member_id AS "poster_id",
                    p.post_date AS "post_date",
                    p.threaded_from AS "threaded_from",
                    react.type AS "react_type",
                    react.member_id AS "react_member_id"
                FROM rooms r
                LEFT JOIN access a
                        ON a.room_id = r.id
                LEFT JOIN memberships m
                        ON m.role_id = a.role_id
                LEFT JOIN posts p
                        ON p.room_id = r.id
                LEFT JOIN reactions react
                        ON react.post_id = p.id
                WHERE r.id = $1

        `, [id])

        if(!result.rows.length) throw new NotFoundError("room not found")

        const roomInfo = {
            id:result.rows[0].id,
            name:result.rows[0].name,
            server_id:result.rows[0].server_id,
            type:result.rows[0].type
        }

        const posts = result.rows.reduce( (postMap, row) => {

            if(row.post_id) {

                if(postMap.has(row.post_id)) {

                    postMap
                        .get(row.post_id)
                        .reactions[row.react_type]
                        .push(row.react_member_id)
                }
                else {
                    postMap.set(row.post_id, {
                        content:row.content,
                        poster_id:row.poster_id,
                        post_date:row.post_date,
                        threaded_from:row.threaded_from,
                        reactions:{
                            [row.react_type]:[row.react_member_id]
                        }
                    })
                }
            }
            return postMap

        }, new Map())

        const members = result.rows.reduce( (memberList, row) => {

            if(row.member_id) memberList.push({
                user_id:row.user_id,
                role_id:row.role_id,
                is_moderator:row.is_moderator
            })

            return memberList
        }, [])

        return {
            ...roomInfo,
            members:[...members],
            posts:[...posts.entries()].map( post => {
                return { ...post[1], id:post[0] }
            })
        }
    };

    /** Update rome with id (presently only allows updating name)
     *
     * returns { id, name, server_id, type }
    */

    static async update(id, {name}) {

        const result = await db.query(`
                UPDATE rooms
                SET name = $2
                WHERE id = $1
                RETURNING id, name, server_id, type
        `,[id, name])

        return result.rows[0]
    }

    /** Removes room with id from database, returns the room data
     *
     * returns {
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
     *          }
     */

    static async remove(id) {

        await db.query(`DELETE FROM access WHERE room_id = $1 `, [id])

        const reactResult = await db.query(`
                    DELETE FROM reactions
                    WHERE post_id = ANY (
                        SELECT id FROM posts WHERE room_id = $1
                    )
                    RETURNING type, member_id, post_id
        `, [id])

        const postResult = await db.query(`
                    DELETE FROM posts
                    WHERE room_id = $1
                    RETURNING
                        id,
                        content,
                        member_id AS "poster_id",
                        post_date,
                        threaded_from
        `, [id])

        const posts = postResult.rows.map( row => {

            return {
                ...row,
                reactions:reactResult.rows.reduce( (reactObj, reaction) => {
                    if( reaction.post_id === row.id ) {

                        if( reactObj[reaction.type] ) {
                            reactObj[reaction.type] = [reaction.member_id]
                        }
                        else {
                            reactObj[reaction.type].push(reaction.member_id)
                        }
                    }
                }, {})
            }
        })

        const roomResult = await db.query(`
                    DELETE FROM rooms
                    WHERE id = $1
                    RETURNING name, server_id, type
        `, [id])

        const roomInfo = roomResult.rows[0]

        return {
            ...roomInfo,
            posts:[...posts]
        }
    };
}

module.exports = Room