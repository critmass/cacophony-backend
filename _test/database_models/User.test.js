"use strict";

const User = require("../../database_models/User");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../../expressError")

const {
    commonAfterAll,
    commonAfterEach,
    commonBeforeAll,
    commonBeforeEach,
    defaultImgURL,
    defaultTime
} = require("./_testCommon")

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Authenticate User", () => {
    it("works to log someone in", async () => {
        const user = await User.authenticate('u1', 'password1')
        expect(user.username).toBe('u1')
        expect(user.memberships instanceof Array).toBeTruthy()
    })
    it("doesn't login if user doesn't exist", async () => {
        try {
            await User.authenticate("nope", "password");
            fail();
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        }
    })
    it("doesn't login if user's password isn't right", async () => {
        try {
            await User.authenticate("u1", "wrong");
            fail();
        } catch (err) {
            expect(err instanceof Error).toBeTruthy();
        }
    })
})

describe("Find All Users", () => {
    it("returns all", async () => {
        const users = await User.findAll()
        expect(users.length).toBe(3)
    })
})

describe("Find User", () => {
    it("returns all if input is null", async () => {
        const users = await User.find()
        expect(users.length).toBe(3)
    })
    it("returns a user based on username", async () => {
        const user = await User.find('u1')
        expect(user.id).toBe(1)
        expect(user.username).toBe('u1')
        expect(user.picture_url ).toBe(defaultImgURL)
        expect(user.last_on).toEqual(defaultTime)
    })
    it("throws an error if username not in database", async () => {
        try {
            await User.find("not_a_user")
            fail()
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Get User", () => {
    it("returns a user based on id", async () => {
        const user = await User.get(1)
        expect(user.id).toBe(1)
        expect(user.username).toBe('u1')
        expect(user.picture_url).toBe(defaultImgURL)
        expect(user.joining_date).toEqual(defaultTime)
    })
    it("throws an error if id not in database", async () => {
        try {
            await User.get(5000)
            fail()
        }
        catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Create User", () => {
    const newUser = {
        username: 'newUser',
        password:"newPassword",
        pictureUrl: defaultImgURL
    }
    it("works to sign someone up", async () => {
        const user = await User.create(newUser)
        expect(user.username).toBe(newUser.username)
        expect(user.picture_url).toBe(newUser.pictureUrl)
    })
    it("doesn't let you create the same username twice", async () => {
        try {
            const user = await User.create({
                username:'u1',
                password:'password',
                pictureUrl:defaultImgURL
            })
            fail()
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Update User", () => {
    it("changes the username", async () => {
        const user = await User.update( {id:1, username:"newU1"})
        expect(user.username).toBe("newU1")
    })
    it("changes the site admin status", async () => {
        const user = await User.update({id:1, isSiteAdmin:true})
        expect(user.username).toBe("u1")
        expect(user.is_site_admin).toBeTruthy()
    })
    it("can't change a username to an existing username", async () => {
        try {
            await User.update({id:1, username:"u2"})
            fail()
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("can't change a username to an existing username", async () => {
        try {
            await User.update({id:5000, username:"newestUsername"})
            fail()
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Remove User", () => {
    it("removes a user", async () => {
        const deletedUser = await User.remove(1)
        const usersLeft = await User.findAll()

        expect(deletedUser.username).toBe("u1")
        expect(deletedUser.picture_url).toBe(defaultImgURL)

        expect(usersLeft.length).toBe(2)
    })
    it("throws an error if there was no user", async () => {
        try {
            await User.remove(5000)
            fail()
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})