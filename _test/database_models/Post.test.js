"use strict";

const Post = require("../../database_models/Post")

const {
    commonAfterAll,
    commonAfterEach,
    commonBeforeAll,
    commonBeforeEach,
    defaultTime
} = require("./_testCommon")

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Find Post", () => {
    it("finds posts by room id", async () => {
        const posts = await Post.find(1)
        expect(posts.length).toBe(3)
    })
    it("throws an error if room id not found", async () => {
        try {
            await Post.find(5000)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Get Post", () => {
    it("gets a post by id", async () => {
        const post = await Post.get(1)
        expect(post.id).toBe(1)
        expect(post.room_id).toBe(1)
        expect(post.member_id).toBe(1)
        expect(post.content).toBe("post 1")
        expect(post.post_date).toEqual(defaultTime)
    })
    it("throws an error if post id not found", async () => {
        try {
            await Post.get(5000)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Create Post", () => {
    it("creates a new post", async () => {
        const newPost = await Post.create(
            { memberId:1, roomId:1, content:"new post"})
        expect(newPost.room_id).toBe(1)
        expect(newPost.content).toBe("new post")
        expect(newPost.member_id).toBe(1)
    })
    it("throws an error if member id not found", async () => {
        try {
            await Post.create(
                {memberId:5000, roomId:1, content:"bad post"})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if room id not found", async () => {
        try {
            await Post.create(
                {memberId:1, roomId:5000, content:"bad post"})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if post content empty", async () => {
        try {
            await Post.create(
                {memberId:1, roomId:1, content:""})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Delete Post", () => {
    it("deletes a post", async () => {
        const deletedPost = await Post.delete(1)
        expect(deletedPost.member_id).toBe(1)
        expect(deletedPost.room_id).toBe(1)
        expect(deletedPost.content).toBe("post 1")
    })
    it("throws an error if post id not found", async () => {
        try {
            await Post.delete(5000)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})