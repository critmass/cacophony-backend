"use strict";

const Membership = require("../../database_models/Membership")
const {
    NotFoundError,
    BadRequestError
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


describe("Find Memberships by Server", () => {
    it("finds memberships by server id", async () => {
        const members = await Membership.findByServer(1)
        expect(members.length).toBe(3)
    })
    it("Throws an error if server doesn't exist", async () => {
        try {
            await Membership.findByServer(5000)

        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy()
        }
    })
})

describe("Find Memberships by User", () => {
    it("finds memberships by user id", async () => {
        const members = await Membership.findByUser(1)
        expect(members.length).toBe(2)
    })
    it("Throws an error if user doesn't exist", async () => {
        try {
            await Membership.findByUser(5000)

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Find Memberships by Role", () => {
    it("finds memberships by role id", async () => {
        const members = await Membership.findByRole(2)
        expect(members.length).toBe(2)
    })
    it("Throws an error if role doesn't exist", async () => {
        try {
            await Membership.findByRole(5000)

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Get Memberships", () => {
    it("gets membership by id", async () => {
        const member = await Membership.get(1)
        expect(member.id).toBe(1)
        expect(member.user_id).toBe(1)
        expect(member.server_id).toBe(1)
        expect(member.role.id).toBe(1)
        expect(member.role.title).toBe("r1a")
        expect(member.role.is_admin).toBe(true)
        expect(member.nickname).toBe("a1")
        expect(member.picture_url).toBe(defaultImgURL)
        expect(member.joining_date).toEqual(defaultTime)
    })
    it("throws an error when there is no membership with that id", async () => {
        try {
            await Membership.get(5000)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Find Memberships", () => {
    it("finds memberships by user id", async () => {
        const members = await Membership.find({userId:1})
        expect(members.length).toBe(2)
    })
    it("Throws an error if user doesn't exist", async () => {
        try {
            await Membership.find({userId:5000})

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("finds memberships by server id", async () => {
        const members = await Membership.find({serverId:1})
        expect(members.length).toBe(3)
    })
    it("Throws an error if server doesn't exist", async () => {
        try {
            await Membership.find({serverId:5000})

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("finds memberships by role id", async () => {
        const members = await Membership.find({roleId:1})
        expect(members.length).toBe(1)
    })
    it("Throws an error if role doesn't exist", async () => {
        try {
            await Membership.find({roleId:5000})

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("finds memberships by role id and user id", async () => {
        const members = await Membership.find({roleId:2, userId:2})
        expect(members.length).toBe(1)
    })
    it("Throws an error if membership doesn't exist", async () => {
        try {
            await Membership.find({roleId:7, userId:1})

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("finds memberships by server id and user id", async () => {
        const members = await Membership.find({serverId:1, userId:2})
        expect(members.length).toBe(1)
    })
    it("Throws an error if membership doesn't exist", async () => {
        try {
            await Membership.find({serverId:7, userId:1})

        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Create Memberships", () => {
    const newMember = {userId:1, roleId:6, serverId:3}
    it("creates a new member", async () => {
        const member = await Membership.create(newMember)
        expect(member.id).toBe(8)
        expect(member.user_id).toBe(1)
        expect(member.server_id).toBe(3)
        expect(member.role.id).toBe(6)
        expect(member.role.title).toBe('r3n')
        expect(member.picture_url).toBe(defaultImgURL)
    })
})

describe("Update Memberships Nickname", () => {
    it("updates the nickname", async () => {
        const updateNickname = await Membership.updateNickname(1, "updated_nickname")
        expect(updateNickname.nickname).toBe("updated_nickname")
        expect(updateNickname.id).toBe(1)
    })
    it("throws an error if membership doesn't exist", async () => {
        try {
            await Membership.updateNickname(5000, "not_a_member")
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if nickname already exists on server", async () => {
        try {
            await Membership.updateNickname(1, "m2")
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Update Membership's Role", () => {
    it("updates the role of a membership", async () => {
        const member = await Membership.updateRole(2, 1)
        expect(member.id).toBe(2)
        expect(member.user_id).toBe(2)
        expect(member.server_id).toBe(1)
        expect(member.role_id).toBe(1)
        expect(member.nickname).toBe("m2")
        expect(member.picture_url).toBe(defaultImgURL)
        expect(member.joining_date).toEqual(defaultTime)
    })
    it("throws an error when membership doesn't exist", async () => {
        try {
            await Membership.updateRole(5000, 1)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error when role doesn't exist", async () => {
        try {
            await Membership.updateRole(1, 5000)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error when role and member not on same server", async () => {
        try {
            await Membership.updateRole(1, 5)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Remove Membership", () => {
    it("it removes a membership", async () => {
        const removedMember = await Membership.remove(1)
        expect(removedMember.user_id).toBe(1)
        expect(removedMember.server_id).toBe(1)
        expect(removedMember.role_id).toBe(1)
    })
    it("throws an error if membership id doesn't exist", async () => {
        try {
            await Membership.remove(5000)
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})