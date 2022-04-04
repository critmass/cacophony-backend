"use strict";

/** Routes for rooms. */

const jsonschema = require("jsonschema");
const Post = require("../database_models/Post");
const newPostSchema = require("../json_schema/postNew.json")
// const updatePostSchema = require("../json_schema/postUpdate.json")

const { BadRequestError } = require("../expressError");
const Membership = require("../database_models/Membership");


/** POST / {content} => {id, member_id, room_id, server_id, content} */

const createPost = async (req, res, next) => {
    try {
        console.log(req.body)
        const validator = jsonschema.validate(req.body, newPostSchema)
        if (!validator.valid) throw new BadRequestError(validator.errors)

        const {roomId, serverId} = req.params
        const userId = res.locals.user.id
        const members = await Membership.find({userId, serverId})
        const memberId = members[0].id

        console.log(`${memberId}:${roomId}-${req.body.content}`)

        const post = await Post.create({...req.body, roomId, memberId})

        return res.status(201).json({post})

    } catch (error) {
        next(error)
    }
}

/** GET / => [{id, member_id, room_id, server_id, content}, ...]  */

const getPosts = async (req, res, next) => {
    try {
        const {roomId} = req.params
        const posts = await Post.find(roomId)
        return res.status(200).json({posts})
    } catch (error) {
        next(error)
    }
}
/** GET /[postId] => {id, member_id, room_id, server_id, content}  */

const getPost = async (req, res, next) => {
    try {
        const {postId} = req.params
        const post = await Post.get(postId)
        return res.status(200).json({post})
    } catch (error) {
        next(error)
    }
}

/** PATCH /[postId] {}
 *              => {id, member_id, room_id, server_id, content}   */

// not implimented
const updatePost = async (req, res, next) => {
    try {
        throw BadRequestError("NOT IMPLIMENTED")
    } catch (error) {
        next(error)
    }
}

/** PUT /[postId]  */


/** DELETE /[postId] => {id, member_id, room_id, server_id, content}  */

const removePost = async (req, res, next) => {
    try {
        const {postId} = req.params
        const post = await Post.delete(postId)
        return res.status(201).json({post})
    } catch (error) {
        next(error)
    }
}

module.exports = {createPost, getPost, getPosts, updatePost, removePost}