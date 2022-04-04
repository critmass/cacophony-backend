"use strict";

const request = require("supertest");

const app = require("../../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    defaultColor1,
    user1Token,
    user2Token,
    user4Token,
    user5Token,
    defaultColor2
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST /servers/:serverId/roles", () => {
    const newRole = {
                title:"new role",
                color:{r:60, b:60, g:60},
                isAdmin:false
            }
    it("should create a new role if user is a server admin", async () => {
        const resp = await request(app)
                                .post("/servers/1/roles")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
        expect(resp.body.role.server_id).toBe(1)
        expect(resp.body.role.title).toBe(newRole.title)
        expect(resp.body.role.color.r).toBe(newRole.color.r)
        expect(resp.body.role.color.b).toBe(newRole.color.b)
        expect(resp.body.role.color.g).toBe(newRole.color.g)
    })
    it("should return 401 if sender is non-admin", async () => {
        const resp = await request(app)
                                .post("/servers/1/roles")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 404 if server not found", async () => {
        const resp = await request(app)
                                .post("/servers/5000/roles")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("GET /servers/:serverId/roles", () => {
    it("should get all roles in server if sender is a member", async () => {
        const resp = await request(app)
                                .get("/servers/1/roles")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.roles instanceof Array).toBeTruthy()
    })
    it("should return 401 if the user isn't a member of the server", async () => {
        const resp = await request(app)
                                .get("/servers/1/roles")
                                .set(
                                    "authorization",
                                    `Bearer ${user4Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 404 if server not found", async () => {
        const resp = await request(app)
                                .get("/servers/5000/roles")
                                .set(
                                    "authorization",
                                    `Bearer ${user4Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("GET /servers/:serverId/roles/:roleId", () => {
    it("should return info of role when user is a server admin", async () => {
        const resp = await request(app)
                                .get("/servers/1/roles/2")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.role.id).toBe(2)
        expect(resp.body.role.title).toBe("role1m")
        expect(resp.body.role.color.r).toBe(defaultColor2.r)
        expect(resp.body.role.color.b).toBe(defaultColor2.b)
        expect(resp.body.role.color.g).toBe(defaultColor2.g)
        expect(resp.body.role.access instanceof Array).toBeTruthy()
        expect(resp.body.role.members instanceof Array).toBeTruthy()
    })
    it("should return 401 if user isn't a server admin", async () => {
        const resp = await request(app)
                                .get("/servers/1/roles/2")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 404 if role not on server", async () => {
        const resp = await request(app)
                                .get("/servers/1/roles/5")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 if role not found", async () => {
        const resp = await request(app)
                                .get("/servers/1/roles/5000")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
    it("should return 404 if server not found", async () => {
        const resp = await request(app)
                                .get("/servers/5000/roles/5")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("PATCH /servers/:serverId/roles/:roleId", () => {
    const newRole = {
        title:"new role",
        color:{r:5, b:10, g:20},
        isAdmin:true
    }
    it("should update a role if the user is a server admin", async () => {
        const resp = await request(app)
                                .patch("/servers/1/roles/2")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
        expect(resp.body.role.id).toBe(2)
        expect(resp.body.role.title).toBe(newRole.title)
        expect(resp.body.role.color.r).toBe(newRole.color.r)
        expect(resp.body.role.color.b).toBe(newRole.color.b)
        expect(resp.body.role.color.g).toBe(newRole.color.g)
    })
    it("should return 401 status if user is not server admin", async () => {
        const resp = await request(app)
                                .patch("/servers/1/roles/1")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
        const resp1 = await request(app)
                                .patch("/servers/1/roles/1")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp1.status).toBe(401)
    })
    it("should return 403 status if role not on server", async () => {
        const resp = await request(app)
                                .patch("/servers/1/roles/5")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 status if role not found", async () => {
        const resp = await request(app)
                                .patch("/servers/1/roles/5000")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
    it("should return 404 status if server not found", async () => {
        const resp = await request(app)
                                .patch("/servers/5000/roles/5")
                                .send(newRole)
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("DELETE /servers/:serverId/roles/:roleId", () => {
    it("should delete a role if the user is a server admin", async () => {
        const resp = await request(app)
                                .delete("/servers/1/roles/7")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
        expect(resp.body.role.title).toBe("role to be deleted")
        expect(resp.body.role.color.r).toBe(defaultColor1.r)
        expect(resp.body.role.color.b).toBe(defaultColor1.b)
        expect(resp.body.role.color.g).toBe(defaultColor1.g)
    })
    it("should return 401 status if user is not server admin", async () => {
        const resp = await request(app)
                                .delete("/servers/1/roles/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
        const resp1 = await request(app)
                                .delete("/servers/1/roles/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp1.status).toBe(401)
    })
    it("should return 404 status if role not on server", async () => {
        const resp = await request(app)
                                .delete("/servers/1/roles/5")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 status if role not found", async () => {
        const resp = await request(app)
                                .delete("/servers/1/roles/5000")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
    it("should return 404 status if server not found", async () => {
        const resp = await request(app)
                                .delete("/servers/5000/roles/5")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(404)
    })

})