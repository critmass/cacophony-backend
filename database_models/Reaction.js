"use strict";

const db = require("../db")

/** Related functions for users */

class Reaction {

    /** Creates a reaction with given data
     *
     * data should be {memberId, postId, type}
     *
     * returns {member_id, post_id, type}
     */

    static async create(memberId, postId, type);

    /** Finds all reaction for post with id
     *
     * returns [{member_id, post_id, type}, ...]
     */

    static async find(postId);

    /** Removes a reaction with a given data
     *
     * data should be {memberId, postId, type}
     *
     * returns {member_id, post_id, type}
     */

    static async remove(memberId, postId, type);
}

module.exports = Reaction