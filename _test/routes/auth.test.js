"use strict";

const request = require("supertest")

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommon");

const app = require("../../app")

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("POST /auth/token", () => {
    it(
        "works to generate a token when valid user id and password combo",
        async () => {
            const resp = await request(app)
                .post("/auth/token")
                .send({
                    username: "user1",
                    password: "password1"
                });
            expect(resp.body).toEqual({
                "token": expect.any(String),
                "user_id": expect.any(Number)
            });
    })
    it(`throws a 401 error when invalid user id`, async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "no-such-user",
                password: "password1",
            });
        expect(resp.statusCode).toEqual(401);
    })
    it("throws a 401 error when invalid password", async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "user1",
                password: "nope",
            });
        expect(resp.statusCode).toEqual(401);
    })
    it("throws a 400 error when not missing info", async () => {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: "user1",
            });
        expect(resp.statusCode).toEqual(400);
    })
})

describe("POST /auth/register", () => {
    it("creates a new user", async () => {
        const resp = await request(app)
            .post("/auth/register")
            .send({
                username: "new",
                password: "password"
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            "token": expect.any(String),
            "user_id": expect.any(Number)
        });
    })
    it("throws a 400 error when invalid data provided", async () => {

        const resp = await request(app)
                        .post("/auth/register")
                        .send({ username:"newer" })

        expect(resp.statusCode).toEqual(400)
    })
})