"use strict";

const request = require("supertest");

const app = require("../../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    user2Token,
} = require("../routes/_testCommon");

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST servers/:serverId/rooms/:roomId/posts", () => {
    const newPost = {content:"new post"}
    it("should create a post and return it", async () => {
        const resp = await request(app)
            .post("/servers/1/rooms/1/posts")
            .send(newPost)
            .set(
                "authorization",
                `Bearer ${user2Token}`
            )
        expect(resp.status).toBe(201)
        expect(resp.body.post.content).toBe(newPost.content)
    })

})