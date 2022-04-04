"use strict";

const request = require("supertest");

const app = require("../../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    user1Token,
    user2Token,
    user5Token
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST /servers/:serverId/rooms", () => {
    const newRoom = {name: "new room"}
    it("should create a new room if the user is a server admin", async () => {
        const resp = await request(app)
                                .post("/servers/1/rooms")
                                .send(newRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
        expect(resp.body.room.name).toBe(newRoom.name)
    })
    it("should return 401 if user isn't a server admin", async () => {
        const resp = await request(app)
                                .post("/servers/1/rooms")
                                .send(newRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 404 if server is not found", async () => {
        const resp = await request(app)
                                .post("/servers/5000/rooms")
                                .send(newRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("GET /servers/:serverId/rooms", () => {
    it("should create a new room if the user is a server member", async () => {
        const resp = await request(app)
                                .get("/servers/1/rooms")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.rooms instanceof Array).toBeTruthy()
    })
    it("should return 401 if user ins't a member of the server", async () => {
        const resp = await request(app)
                                .get("/servers/1/rooms")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 404 if server doesn't exist", async () => {
        const resp = await request(app)
                                .get("/servers/5000/rooms")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("GET /servers/:serverId/rooms/:roomId", () => {
    it("should return information on a room if user is a member", async () => {
        const resp = await request(app)
                                .get("/servers/1/rooms/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.room.name).toBe("room11")
    })
    it("should return 404 status code if user is not a member", async () => {
        const resp = await request(app)
                                .get("/servers/1/rooms/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 403 status code room is not on server", async () => {
        const resp = await request(app)
                                .get("/servers/1/rooms/5")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 status code room is not found", async () => {
        const resp = await request(app)
                                .get("/servers/1/rooms/5000")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(404)
    })
    it("should return 404 status if server not found", async () => {
        const resp = await request(app)
                                .get("/servers/5000/rooms/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user5Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("PATCH /servers/:serverId/rooms/:roomId", () => {
    const updatedRoom = {name:"updated room"}
    it("should update a new room if the user is a server admin", async () => {
        const resp = await request(app)
                                .patch("/servers/1/rooms/1")
                                .send(updatedRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
        expect(resp.body.room.name).toBe(updatedRoom.name)
    })
    it("should return 401 if user isn't a server admin", async () => {
        const resp = await request(app)
                                .patch("/servers/1/rooms/1")
                                .send(updatedRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 403 if room not on server", async () => {
        const resp = await request(app)
                                .patch("/servers/1/rooms/5")
                                .send(updatedRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 if room not found", async () => {
        const resp = await request(app)
                                .patch("/servers/1/rooms/5000")
                                .send(updatedRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
    it("should return 404 if server not found", async () => {
        const resp = await request(app)
                                .patch("/servers/5000/rooms/1")
                                .send(updatedRoom)
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("DELETE /servers/:serverId/rooms/:roomId", () => {
    it("should delete a server if the user is a server admin", async () => {
        const resp = await request(app)
                                .delete("/servers/1/rooms/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(201)
        expect(resp.body.room.name).toBe("room11")
    })
    it("should return 401 status if the user is not a server admin", async () => {
        const resp = await request(app)
                                .delete("/servers/1/rooms/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return 403 status if room not on server", async () => {
        const resp = await request(app)
                                .delete("/servers/1/rooms/5")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(403)
    })
    it("should return 404 status if server not found", async () => {
        const resp = await request(app)
                                .delete("/servers/5000/rooms/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
    it("should return 404 status if room not found", async () => {
        const resp = await request(app)
                                .delete("/servers/1/rooms/5000")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(404)
    })
})