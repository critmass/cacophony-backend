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
    user3Token
} = require("./_testCommon");


beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST /users", () => {
    it(
        "creates a new user if the post is sent by an site administrator",
        async () => {
                const resp = await request(app)
                                        .post("/users")
                                        .send({
                                            username:"newUser",
                                            password:"newPassword",
                                            pictureUrl:"profilePicture.jpg",
                                            isSiteAdmin:false
                                        })
                                        .set(
                                            "authorization",
                                            `Bearer ${user3Token}`
                                        )

                expect(resp.status).toBe(201)
    })
    it(
        "should send fail code 401 when someone " +
        "who isn't a site admin tries to create " +
        "a new user",
        async () => {
            const resp = await request(app)
                                    .post("/users")
                                    .send({
                                        username:"evenNewerUser",
                                        password:"password",
                                        pictureUrl:"profilePicture.jpg",
                                        isSiteAdmit:false
                                    })
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(401)
    })
})

describe("GET /users", () => {
    it(
        "should return an array of users if requester is logged in",
        async () => {

            const resp = await request(app)
                                    .get("/users")
                                    .set(
                                        "authorization",
                                        `Bearer ${user1Token}`
                                    )
            expect(resp.status).toBe(200)
            expect(resp.body.users instanceof Array).toBeTruthy()
    })
    it("it should return 401 if requester isn't logged in", async () => {

        const resp = await request(app).get("/users")
        expect(resp.status).toBe(401)
    })
})

describe("GET /users/:userId", () => {
    it("should return user info if requester is the same user", async () => {

        const resp = await request(app)
                                .get("/users/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.user.id).toBe(1)
        expect(resp.body.user.username).toBe("user1")
        expect(resp.body.user.memberships instanceof Array).toBeTruthy()
    })
    it("should return user info if requester is a site admin", async () => {

        const resp = await request(app)
                                .get("/users/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user3Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.user.id).toBe(1)
        expect(resp.body.user.username).toBe("user1")
        expect(resp.body.user.memberships instanceof Array).toBeTruthy()
    })
    it(
        "should return a 401 error code if requester " +
        "isn't site admin or requested user",
        async () => {
            const resp = await request(app).get("/users/1")

            expect(resp.status).toBe(401)
        }
    )
})

describe("PATCH /users/:userId", () => {
    it("should update username if requester is the user", async () => {
        const resp = await request(app)
                        .patch("/users/1")
                        .send({username:"newUsername"})
                        .set("authorization", `Bearer ${user1Token}`)

        expect(resp.status).toBe(201)
        expect(resp.body.user.username).toBe("newUsername")
    })
    it("should update profile picture if requester is the user", async () => {
        const resp = await request(app)
                        .patch("/users/1")
                        .send({pictureUrl:"newProfile.jpg"})
                        .set("authorization", `Bearer ${user1Token}`)

        expect(resp.status).toBe(201)
        expect(resp.body.user.picture_url).toBe("newProfile.jpg")
    })
    it("should update username if requester is a site admin", async () => {
        const resp = await request(app)
                        .patch("/users/1")
                        .send({username:"newUsername"})
                        .set("authorization", `Bearer ${user3Token}`)

        expect(resp.status).toBe(201)
        expect(resp.body.user.username).toBe("newUsername")
    })
    it("should update profile picture if requester is a site admin", async () => {
        const resp = await request(app)
                        .patch("/users/1")
                        .send({pictureUrl:"newProfile.jpg"})
                        .set("authorization", `Bearer ${user3Token}`)

        expect(resp.status).toBe(201)
        expect(resp.body.user.picture_url).toBe("newProfile.jpg")
    })
    it("should return a 401 if requester is not current user or site admin", async () => {
        const resp = await request(app)
                                .patch("/users/1")
                                .send({username:"newUsername"})
                                .set(
                                    "authorization",
                                    `Bearer ${user2Token}`
                                )
        expect(resp.status).toBe(401)
    })
    it("should return a 404 error if user doesn't exist", async () => {
        const resp = await request(app)
                                .patch("/users/5000")
                                .send({username:"newUsername"})
                                .set(
                                    "authorization",
                                    `Bearer ${user3Token}`
                                )
        expect(resp.status).toBe(404)
    })
})

describe("DELETE /users/:userId", () => {
    it("should delete a user if the requester is the user", async () => {
        const resp = await request(app)
                                .delete("/users/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user1Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.user.username).toBe("user1")
    })
    it("should delete a user if the requester is a site admin", async () => {
        const resp = await request(app)
                                .delete("/users/1")
                                .set(
                                    "authorization",
                                    `Bearer ${user3Token}`
                                )
        expect(resp.status).toBe(200)
        expect(resp.body.user.username).toBe("user1")
    })
    it(
        "should return a 401 if a user tries to delete an account " +
        "that they aren't authorized to delete",
        async () => {
            const resp = await request(app)
                                    .delete("/users/3")
                                    .set(
                                        "authorization",
                                        `Bearer ${user2Token}`
                                    )

            expect(resp.status).toBe(401)
        }
    )
    it("should return 400 error code if user doesn't exist", async () => {
        const resp = await request(app)
                                .delete("/users/5000")
                                .set(
                                    "authorization",
                                    `Bearer ${user3Token}`
                                )
    })
})