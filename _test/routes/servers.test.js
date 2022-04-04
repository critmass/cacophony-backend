"use strict";

const request = require("supertest");

const app = require("../../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    user1Token,
    defaultImgURL,
    user5Token,
    user4Token
} = require("./_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST /servers", () => {
    const newServer = {
        name:"newServer",
        pictureUrl:"newImage.jpg"
    }
    it("creates a new server if sent by a valid user", async () => {
       const resp = await request(app)
                                    .post("/servers")
                                    .send(newServer)
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )

        expect(resp.status).toBe(201)
        expect(resp.body.server.name).toBe(newServer.name)
        expect(resp.body.server.picture_url).toBe(newServer.pictureUrl)
    })
    it("throws a 401 error if invalid user sends it", async () => {
        const resp = await request(app)
                                    .post("/servers")
                                    .send(newServer)

        expect(resp.status).toBe(401)
    })
    it("throws a 400 error if request is missing a server name", async () => {
        const resp = await request(app)
                                .post("/servers")
                                .send({pictureUrl:"someImage.jpg"})
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(400)
    })
})

describe("GET /servers", () => {
    it("returns all the servers if called by a valid user", async () => {
        const resp = await request(app)
                                    .get("/servers")
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(200)
        expect(resp.body.servers instanceof Array).toBeTruthy()
    })
    it("returns a 401 error if called without a valid user token", async () => {
        const resp = await request(app).get("/servers")
    })
})

describe("GET /servers/:serverId", () => {
    it("returns details on a given server " +
        "if user is a member of the server", async () => {
            const resp = await request(app)
                                        .get("/servers/1")
                                        .set(
                                            "authorization",
                                            `Bearer ${user1Token}`
                                        )
            expect(resp.status).toBe(200)
            expect(resp.body.server.id).toBe(1)
            expect(resp.body.server.name).toBe("server1")
            expect(resp.body.server.picture_url).toBe(defaultImgURL)
            expect(resp.body.server.members instanceof Array).toBeTruthy()
            expect(resp.body.server.rooms instanceof Array).toBeTruthy()
    })
    it("returns details on a given server " +
        "if user is a site admin", async () => {
            const resp = await request(app)
                                        .get("/servers/1")
                                        .set(
                                            "authorization",
                                            `Bearer ${user5Token}`
                                        )
            expect(resp.status).toBe(200)
            expect(resp.body.server.id).toBe(1)
            expect(resp.body.server.name).toBe("server1")
            expect(resp.body.server.picture_url).toBe(defaultImgURL)
            expect(resp.body.server.members instanceof Array).toBeTruthy()
            expect(resp.body.server.rooms instanceof Array).toBeTruthy()
    })
    it("returns 401 if user is not a member or site admin", async () => {
        const resp = await request(app)
                                    .get("/servers/1")
                                    .set(
                                        "authorization",
                                        `Bearer ${user4Token}`
                                    )
        expect(resp.status).toBe(401)
    })
    it("returns 404 if server is not found", async () => {
        const resp = await request(app)
                                    .get("/servers/5000")
                                    .set(
                                        "authorization",
                                        `Bearer ${user5Token}`
                                    )
        expect(resp.status).toBe(404)
    })
})

describe("PATCH /servers/:serverId", () => {
    const updatedServer = {
        name: "newServer",
        pictureUrl: "newImage.jpg"
    }
    it("should update server's information if sent by an admin", async () => {
        const resp = await request(app)
                                    .patch("/servers/1")
                                    .send(updatedServer)
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
        expect(resp.status).toBe(201)
        expect(resp.body.server.id).toBe(1)
        expect(resp.body.server.name).toBe(updatedServer.name)
        expect(resp.body.server.picture_url).toBe(updatedServer.pictureUrl)
    })
    it("should return 401 status if user isn't an admin of the server",
        async () => {
            const resp = await request(app)
                                        .patch("/servers/1")
                                        .send(updatedServer)
                                        .set(
                                            "authorization",
                                            `Bearer ${user5Token}`
                                        )
            expect(resp.status).toBe(401)
    })
    it("should return 404 status if server not found", async () => {
        const resp = await request(app)
                                    .patch("/servers/5000")
                                    .send(updatedServer)
                                    .set(
                                        "authorization",
                                        `Bearer ${user5Token}`
                                    )
        expect(resp.status).toBe(404)
    })
})

describe("DELETE /servers/:serverId", () => {
    it("should delete a server if the user is one of its admins", async () => {
        const resp = await request(app)
                                .delete("/servers/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
    })
    it("should delete a server if the user is a site admin", async () => {
        const resp = await request(app)
                                .delete("/servers/2")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(201)
    })
    it("should return a 401 status code if not an admin or site admin", async () => {
        const resp = await request(app)
                                .delete("/servers/3")
                                .set(
                                    "authorization",
                                    `Bearer ${user4Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return a 404 if server not found", async () => {
        const resp = await request(app)
                                .delete("/servers/5000")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(404)
    })
})