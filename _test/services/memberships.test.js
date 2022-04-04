"use strict";

const request = require("supertest");

const app = require("../../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    user1Token,
    user4Token,
    user2Token,
    user5Token,
    user3Token
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST /servers/:serverId/members", () => {
    const newMember = {
        userId:4,
        roleId:2,
        serverId:1,
        serverIdnickname:"new guy"
    }
    it("should take a user and a role to create a " +
        "membership if current user is an admin", async () => {
            const resp = await request(app)
                                    .post("/servers/1/members")
                                    .send(newMember)
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(201)
    })
    it("should return a 401 status code if user isn't an admin", async () => {
        const resp = await request(app)
                                .post("/servers/2/members")
                                .send(newMember)
                                .set(
                                        "authorization",
                                        `Bearer ${user4Token}`
                                    )
        expect(resp.status).toBe(401)
    })
    it("should return a 404 if user isn't valid", async () => {
        const resp = await request(app)
                                .post("/servers/1/members")
                                .send({
                                    userId:5000,
                                    roleId:2,
                                    nickname:"another new guy"
                                })
                                .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(404)
    })
    it("should return a 403 if role isn't on server", async () => {
        const resp = await request(app)
                                .post("/servers/1/members")
                                .send({
                                    userId:4,
                                    roleId:5,
                                    nickname:"another new guy"
                                })
                                .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(403)
    })
    it("should return a 404 if the server doesn't exist", async () => {
        const resp = await request(app)
                                .post("/servers/5000/members")
                                .send(newMember)
                                .set(
                                        "authorization",
                                        `Bearer ${user4Token}`
                                    )
        expect(resp.status).toBe(404)
    })
})

describe("GET /servers/:serverId/members", () => {
    it("should return a list of members of the server if " +
        "the user is a member of the server", async () => {
            const resp = await request(app)
                                    .get("/servers/1/members")
                                    .set(
                                        "authorization",
                                        `Bearer ${user2Token}`
                                    )
            expect(resp.status).toBe(200)
            expect(resp.body.members instanceof Array).toBeTruthy()
    })
    it("should return a list of members of the server if " +
        "the user is a site admin", async () => {
            const resp = await request(app)
                                    .get("/servers/1/members")
                                    .set(
                                        "authorization",
                                        `Bearer ${user5Token}`
                                    )
            expect(resp.status).toBe(200)
            expect(resp.body.members instanceof Array).toBeTruthy()
    })
    it("should return 401 if the current user is not a " +
        "member of the server or a site admin", async () => {
            const resp = await request(app)
                                    .get("/servers/1/members")
                                    .set(
                                        "authorization",
                                        `Bearer ${user4Token}`
                                    )
            expect(resp.status).toBe(401)
    })
    it("should return 404 status if server not found", async () => {
        const resp = await request(app)
                                .get("/servers/5000/members")
                                .set(
                                        "authorization",
                                        `Bearer ${user5Token}`
                                    )
        expect(resp.status).toBe(404)
    })
})

describe("GET /servers/:serverId/members/:memberId", () => {
    it("should return information about a membership if " +
        "current user is a member of the server", async () => {
            const resp = await request(app)
                                    .get("/servers/1/members/1")
                                    .set(
                                        "authorization",
                                        `Bearer ${user2Token}`
                                    )
            expect(resp.status).toBe(200)
            expect(resp.body.membership.id).toBe(1)
            expect(resp.body.membership.user_id).toBe(1)
            expect(resp.body.membership.role.id).toBe(1)
    })
    it("should return 401 if current user is not a member of " +
        "the server", async () => {
            const resp = await request(app)
                                    .get("/servers/1/members/1")
                                    .set(
                                        "authorization",
                                        `Bearer ${user4Token}`
                                    )
            expect(resp.status).toBe(401)
    })
    it("should return 404 if server not found", async () => {
        const resp = await request(app)
                                .get("/servers/5000/members/1")
                                .set(
                                        "authorization",
                                        `Bearer ${user4Token}`
                                    )
        expect(resp.status).toBe(404)
    })
    it("should return 403 if member not in server", async () => {
        const resp = await request(app)
                                .get("/servers/1/members/5")
                                .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(403)
    })
    it("should return 404 if member not in server", async () => {
        const resp = await request(app)
                                .get("/servers/1/members/5000")
                                .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(404)
    })
})

describe("PATCH /servers/:serverId/members/:memberId", () => {
    it("should change the member nickname if " +
        "the current user is the member", async () => {
            const resp = await request(app)
                                    .patch("/servers/1/members/1")
                                    .send({nickname:"new name"})
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(201)
            expect(resp.body.membership.id).toBe(1)
            expect(resp.body.membership.nickname).toBe("new name")
            expect(resp.body.membership.role.id).toBe(1)
    })
    it("should change the member nickname if " +
        "the current user is the member", async () => {
            const resp = await request(app)
                                    .patch("/servers/1/members/1")
                                    .send({pictureUrl:"newImage.jpg"})
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(201)
            expect(resp.body.membership.id).toBe(1)
            expect(resp.body.membership.picture_url).toBe("newImage.jpg")
            expect(resp.body.membership.role.id).toBe(1)
    })
    it("should change the member nickname if " +
        "the current user is a server admin", async () => {
            const resp = await request(app)
                                    .patch("/servers/1/members/2")
                                    .send({nickname:"newest name"})
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(201)
            expect(resp.body.membership.id).toBe(2)
            expect(resp.body.membership.nickname).toBe("newest name")
            expect(resp.body.membership.role.id).toBe(2)
    })
    it("should change the member nickname if " +
        "the current user is a server admin", async () => {
            const resp = await request(app)
                                    .patch("/servers/1/members/2")
                                    .send({roleId:1})
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(201)
            expect(resp.body.membership.id).toBe(2)
            expect(resp.body.membership.role.id).toBe(1)
    })
    it("should return 401 if current user isn't admin " +
        "and is trying to change role id", async () => {
            const resp = await request(app)
                                    .patch("/servers/1/members/2")
                                    .send({roleId:1})
                                    .set(
                                        "authorization",
                                        `Bearer ${user2Token}`
                                    )
            expect(resp.status).toBe(401)
    })
    it("should return 401 if an invalid user attempts to patch membership",
        async () => {
            const resp = await request(app)
                                    .patch("/servers/1/members/2")
                                    .send({nickname:"invalid"})
                                    .set(
                                        "authorization",
                                        `Bearer ${user3Token}`
                                    )
            expect(resp.status).toBe(401)
    })
    it("should return 403 if an invalid membership", async () => {
        const resp = await request(app)
                                .patch("/servers/1/members/5")
                                .send({nickname:"failure"})
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 if server never found", async () => {
        const resp = await request(app)
                                .patch("/servers/5000/members/5")
                                .send({nickname:"failure"})
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("DELETE /servers/:serverId/members/:roleId", () => {
    it("should remove a server if current user is " +
        "a server admin", async () => {
            const resp = await request(app)
                                    .delete("/servers/1/members/2")
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(201)
        expect(resp.body.membership.user_id).toBe(2)
        expect(resp.body.membership.role_id).toBe(2)
        expect(resp.body.membership.nickname).toBe("Member2.2.2")
    })
    it("should remove a server if current user is " +
        "the member being deleted", async () => {
            const resp = await request(app)
                                    .delete("/servers/1/members/3")
                                    .set(
                                        "authorization",
                                        `Bearer ${user3Token}`
                                    )
            expect(resp.status).toBe(201)
            expect(resp.body.membership.user_id).toBe(3)
            expect(resp.body.membership.role_id).toBe(2)
            expect(resp.body.membership.nickname).toBe("Member3.3.2")
    })
    it("should return a 401 if user isn't an admin or the member", async () => {
            const resp = await request(app)
                                    .delete("/servers/2/members/4")
                                    .set(
                                        "authorization",
                                        `Bearer ${user3Token}`
                                    )
            expect(resp.status).toBe(401)
    })
    it("should return a 404 if membership not on the server", async () => {
            const resp = await request(app)
                                    .delete("/servers/2/members/1")
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(403)
    })
    it("should return a 404 if membership doesn't exist", async () => {
            const resp = await request(app)
                                    .delete("/servers/1/members/5000")
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(404)
    })
    it("should return a 404 if server not found", async () => {
            const resp = await request(app)
                                    .delete("/servers/5000/members/1")
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(404)
    })
})