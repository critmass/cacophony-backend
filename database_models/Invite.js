"use strict";

const db = require("../db")


class Invite {

    static async create(roleId, userCap=-1, expirationTime=null);

    static async get(link);

    static async remove(link);
}

module.exports = Invite