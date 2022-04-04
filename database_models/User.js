"use strict";

const bcrypt = require("bcrypt");

const db = require("../db")
const { BCRYPT_WORK_FACTOR } = require("../config");
const { UnauthorizedError, NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { intToColor } = require("../helpers/colorConverter");

/** Related functions for users */

class User {

    /** checks if the password and id are linked
     *
     * returns {
     *              id,
     *              username,
     *              is_site_admin,
     *              memberships:[{
     *                  role:{id, title},
     *                  is_server_admin,
     *                  server:{
     *                      id,
     *                      name,
     *                      picture_url
     *                  }
     *              }, ...]
     *          }
     */

    static async authenticate(username, password) {

        const result = await db.query(`
                SELECT
                    u.id AS "id",
                    u.username AS "username",
                    u.hashed_password AS "password",
                    u.is_site_admin AS "is_site_admin",
                    r.is_admin AS "is_server_admin",
                    m.id AS "member_id",
                    m.server_id AS "server_id",
                    m.role_id AS "role_id"
                FROM users u
                LEFT JOIN memberships m
                        ON u.id = m.user_id
                LEFT JOIN roles r
                        ON m.role_id = r.id
                WHERE u.username = $1
        `, [username])

        if( !result.rows.length ) {
            throw new UnauthorizedError("username not found")
        }

        const rightPassword =
                await bcrypt.compare(password, result.rows[0].password)

        if(rightPassword) {

            return {
                id:result.rows[0].id,
                username:result.rows[0].username,
                is_site_admin:result.rows[0].is_site_admin,
                memberships:result.rows[0].member_id ?
                                result.rows.map( row => {
                                    return {
                                        id:row.member_id,
                                        server_id:row.server_id,
                                        role_id:row.role_id,
                                        is_admin:row.is_server_admin
                                    }
                                }):[]
            }
        }
        else throw new UnauthorizedError("bad password")
    }

    /** Creates a user from the data provided
     *
     * data should be { username, password, picture_url }
     *
     * returns { id, username, picture_url, joining_date, is_site_admin }
     */

    static async create({
                    username,
                    password,
                    pictureUrl=null,
                    isSiteAdmin=false
    }) {

        if(username === undefined || password === undefined ) {
            throw new BadRequestError("username or password not provided")
        }

        const hashedPassword = await bcrypt.hash(
                                                password,
                                                BCRYPT_WORK_FACTOR )
        const now = new Date()

        const result = await db.query(`
                INSERT INTO users (
                    username,
                    hashed_password,
                    picture_url,
                    is_site_admin,
                    joining_date,
                    last_on
                )
                VALUES ($1, $2, $3, $5, $4, $4)
                RETURNING
                    id,
                    username,
                    picture_url,
                    joining_date,
                    is_site_admin
        `, [username, hashedPassword, pictureUrl, now, isSiteAdmin])

        return {...result.rows[0], memberships:[]}
    }

    /** finds with username
     *
     * returns { id, username, picture_url, last_on }
     *
     * throws error if no user exists
     *
     * executes User.findAll() if null is passed in
     */

    static async find(username=null) {

        if(username == null) return await User.findAll()

        const result = await db.query(`
                SELECT id, username, picture_url, last_on
                FROM users
                WHERE username = $1
        `, [username])

        if( result.rows[0].id ) {
            return {
                id:result.rows[0].id,
                username:result.rows[0].username,
                picture_url:result.rows[0].picture_url,
                last_on:result.rows[0].last_on
            }
        }
        else throw new NotFoundError("no users with that username found")
    }

    /** finds all users
     *
     * returns [{id, username, picture_url, last_on}, ...]
     */

    static async findAll() {

        const result = await db.query(`
                SELECT id, username, picture_url, last_on
                FROM users
        `)

        return result.rows.map( row => {
            return {...row}
        })
    }

    /** Given a id, returns data on a room.
     *
     * returns {
     *              id,
     *              username,
     *              picture_url,
     *              joining_date,
     *              last_on,
     *              is_site_admin,
     *              memberships:[{
     *                      id,
     *                      nickname,
     *                      server:{
     *                          Id,
     *                          name,
     *                          picture_url
     *                      },
     *                      role:{
     *                              id,
     *                              title,
     *                              color:{r,b,g},
     *                              is_admin
     *                      }
     *              }, ...]
     *          }
     *
     * throws an error if no user id found
     */

    static async get(id) {

        const result = await db.query(`
                SELECT
                    u.id AS "id",
                    u.username AS "username",
                    u.picture_url AS "picture_url",
                    u.joining_date AS "joining_date",
                    u.is_site_admin AS "is_site_admin",
                    u.last_on AS "last_on",
                    m.id AS "member_id",
                    m.nickname AS "nickname",
                    s.id AS "server_id",
                    s.name AS "server_name",
                    s.picture_url AS "server_picture_url",
                    r.id AS "role_id",
                    r.title AS "role_title",
                    r.color AS "role_color",
                    r.is_admin AS "is_server_admin",
                    m.joining_date AS "joining_date"
                FROM users u
                LEFT JOIN memberships m
                        ON u.id = m.user_id
                LEFT JOIN servers s
                        ON m.server_id = s.id
                LEFT JOIN roles r
                        ON m.role_id = r.id
                WHERE u.id = $1
        `, [id])

        if( !result.rows.length ) {
            throw new NotFoundError("no user with that id")
        }

        const basicInfo = result.rows[0]

        const user = {
            id:basicInfo.id,
            username:basicInfo.username,
            picture_url:basicInfo.picture_url,
            joining_date:basicInfo.joining_date,
            last_on:basicInfo.last_on,
            is_site_admin:basicInfo.is_site_admin,
            memberships:result.rows[0].member_id ?
                result.rows.map( row => {
                    return {
                        id:row.member_id,
                        nickname:row.nickname,
                        joining_date:row.joining_date,
                        server:{
                            id:row.server_id,
                            name:row.server_name,
                            picture_url:row.server_picture_url
                        },
                        role:{
                            id:row.role_id,
                            title:row.role_title,
                            color:intToColor(row.role_color),
                            is_admin:row.is_server_admin
                        }
                    }

                }):
                []
        }
        return user
    }

    /** Updates the last_on of a user to current time with the given id
     *
     * returns {id, last_on}
     */

    static async updateLastOn(id) {

        const time = new Date()

        const result = await db.query(`
                UPDATE users SET last_on = $1 WHERE id = $2
                RETURNING id, last_on
        `, [time, id])

        return result.rows[0]
    }

    /** Updates the username of user with id to newUsername
     *
     * returns {id, {username, is_site_admin}}
     *
     * throws error if id not found
    */

    static async update(data) {

        const {setCols, values} = sqlForPartialUpdate(
            {
                username:data.username,
                pictureUrl:data.pictureUrl,
                isSiteAdmin:data.isSiteAdmin
            }, {
                username:"username",
                pictureUrl:"picture_url",
                isSiteAdmin:"is_site_admin"
        })

        const query = `
                        UPDATE users
                        SET ${setCols}
                        WHERE id = $${values.length + 1}
                        RETURNING
                            id,
                            username,
                            picture_url,
                            is_site_admin,
                            last_on`

        const result = await db.query(query, [...values, data.id])

        if( !result.rows[0] ) throw new NotFoundError("id not found")

        return {...result.rows[0]}
    }


    /** removes user from database
     *
     * returns { username, picture_url }
     */

    static async remove(id) {

        await db.query(`
                UPDATE reactions SET member_id = NULL
                WHERE member_id = ANY (
                    SELECT id FROM memberships
                    WHERE user_id = $1
                )
        `, [id])

        await db.query(`
                UPDATE posts SET member_id = NULL
                WHERE member_id = ANY (
                    SELECT id FROM memberships
                    WHERE user_id = $1
                )
        `, [id])

        await db.query(`
                DELETE FROM memberships WHERE user_id = $1
        `, [id])

        const result = await db.query(`
                DELETE FROM users WHERE id = $1
                RETURNING username, picture_url
        `, [id])

        if( !result.rows[0].username ) {
            throw NotFoundError(`id ${id} not found`)
        }
        else {
            return result.rows[0]
        }
    }
}

module.exports = User