"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for Posts */

class Post {

    /** Creates a post from data
     *
     * data should be { memberId, roomId, content }
     *
     * returns { id, member_id, room_id, content, post_date }
     */

    static async create({memberId, roomId, content, threadedFrom=null}) {

        const now = new Date()

        const result = await db.query(`
                INSERT INTO posts (
                    member_id,
                    room_id,
                    content,
                    threaded_from,
                    post_date
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    id, member_id, room_id, content, post_date
        `, [memberId, roomId, content, threadedFrom, now])

        if(!result.rows.length) throw new BadRequestError("post failed")

        return result.rows[0]
    };

    /** finds all posts to a room at roomId
     *
     * returns [{
     *              id,
     *              poster:{id, name, picture_url},
     *              content,
     *              post_date,
     *              reactions:{ [type]:[member_id, ...], ...}
     *          }, ...]
     */

    static async find(roomId) {

        const result = await db.query(`
                SELECT
                    p.id AS "id",
                    p.member_id AS "member_id",
                    p.content AS "content",
                    p.post_date AS "post_date",
                    p.threaded_from AS "threaded_from",
                    r.type AS "react_type",
                    r.member_id AS "react_member_id",
                    m.nickname AS "poster_name",
                    m.picture_url AS "poster_picture_url"
                FROM posts p
                LEFT JOIN reactions r ON p.id = r.post_id
                LEFT JOIN memberships m ON m.id = p.member_id
                WHERE p.room_id = $1
        `,[roomId])

        if(!result.rows.length) throw new NotFoundError("room not found")

        const posts = result.rows.reduce( (postMap, row) => {

            if(postMap.has(row.id)) {
                if(postMap.get(row.id).reactions[row.react_type]) {
                    postMap.get(row.id).reactions[row.react_type].push(
                        row.react_member_id
                    )
                }
                else {
                    postMap.get(row.id).reactions[row.react_type] =
                                [row.react_member_id]
                }
            }
            else {
                postMap.set(row.id, {
                    id:row.id,
                    poster:{
                        id:row.member_id,
                        name: row.poster_name,
                        picture_url: row.poster_picture_url
                    },
                    content:row.content,
                    post_date:row.post_date,
                    reactions:row.react_type ?
                        {[row.react_type]:[row.react_member_id]} :
                        {}
                })
            }

            return postMap
        }, new Map())

        return [...posts.values()]
    };

    /** Given an id returns a post
     *
     * returns {
     *              id,
     *              member_id,
     *              content,
     *              post_date,
     *              threaded_from
     *              reactions:{ [type]:[member_id, ...], ...}
     *          }
     */

    static async get(id) {

        const result = await db.query(`
                SELECT
                    p.id AS "id",
                    p.member_id AS "member_id",
                    p.room_id AS "room_id",
                    p.content AS "content",
                    p.post_date AS "post_date",
                    p.threaded_from AS "threaded_from",
                    r.type AS "react_type",
                    r.member_id AS "react_member_id"
                FROM posts p
                LEFT JOIN reactions r ON p.id = r.post_id
                WHERE p.id = $1
        `,[id])

        if(!result.rows.length) throw new NotFoundError("post not found")

        const postInfo = {
            id:result.rows[0].id,
            member_id:result.rows[0].member_id,
            room_id:result.rows[0].room_id,
            content:result.rows[0].content,
            post_date:result.rows[0].post_date
        }

        const reactions = result.rows[0].react_type ? result.rows.reduce( (reactObj, row) => {
            if( reactObj[row.react_type] ) {
                reactObj[row.react_type].push(row.react_member_id)
            }
            else {
                reactObj[row.react_type] = [row.react_member_id]
            }
            return reactObj
        }, {}) : {}

        return { ...postInfo, reactions }
    };

    /** Removes post with id
     *
     * returns {
     *              id,
     *              memberId,
     *              content,
     *              post_date,
     *              reactions:{ [type]:[member_id, ...], ...}
     *          }
     */

    static async delete(id) {

        const reactResult = await db.query(`
                DELETE FROM reactions
                WHERE post_id = $1
                RETURNING type, member_id
        `,[id])

        const reactions = reactResult.rows.reduce((reactObj, row) => {
            if (reactObj[row.type] !== null) {
                reactObj[row.type].push(row.member_id)
            }
            else {
                reactObj[row.type] = [row.member_id]
            }
            return reactObj
        }, {})

        const result = await db.query(`
                DELETE FROM posts
                WHERE id = $1
                RETURNING member_id, content, post_date, room_id
        `,[id])

        if (!result.rows.length) throw new NotFoundError("post not found")

        const postInfo = {
            member_id: result.rows[0].member_id,
            room_id: result.rows[0].room_id,
            content: result.rows[0].content,
            post_date: result.rows[0].post_date,
            threaded_from:result.rows[0].threaded_from
        }

        return { ...postInfo, reactions }
    };
}

module.exports = Post