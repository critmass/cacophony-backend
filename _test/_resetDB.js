const db = require("../db")

const resetDB = async () => {

    await db.query("DELETE FROM reactions")
    await db.query("DELETE FROM posts")
    await db.query("DELETE FROM memberships")
    await db.query("DELETE FROM access")
    await db.query("DELETE FROM rooms")
    await db.query("DELETE FROM roles")
    await db.query("DELETE FROM users")
    await db.query("DELETE FROM servers")
    await db.query("DELETE FROM invites")

    await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1")
    await db.query("ALTER SEQUENCE servers_id_seq RESTART WITH 1")
    await db.query("ALTER SEQUENCE rooms_id_seq RESTART WITH 1")
    await db.query("ALTER SEQUENCE roles_id_seq RESTART WITH 1")
    await db.query("ALTER SEQUENCE posts_id_seq RESTART WITH 1")
    await db.query("ALTER SEQUENCE memberships_id_seq RESTART WITH 1")
}

module.exports = {resetDB}