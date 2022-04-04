"use strict";

const Server = require("../../database_models/Server")

const {
    commonAfterAll,
    commonAfterEach,
    commonBeforeAll,
    commonBeforeEach,
    defaultImgURL,
    defaultTimeSQL
} = require("./_testCommon")

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Find All Servers", () => {
    it("finds all servers", async () => {
        const servers = await Server.findAll()
        expect(servers.length).toBe(3)
    })
})

describe("Find Server", () => {
    it("finds all public servers when nothing is passed in", async () => {
        const servers = await Server.find()
        expect(servers.length).toBe(3)
    })
    it("finds a server by name", async () => {
        const results = await Server.find('s1')
        const server = results[0]
        expect(server.id).toBe(1)
        expect(server.name).toBe('s1')
        expect(server.picture_url).toBe(defaultImgURL)
        expect(server.start_date).toBe(defaultTimeSQL)
    })
    it("throws an error when they can't find server by name", async () => {
        try {
            await Server.find("not_a_server")
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Get Server", () => {
    it("gets a server by id", async () => {
        const server = await Server.get(1)
        expect(server.id).toBe(1)
        expect(server.name).toBe('s1')
        expect(server.picture_url).toBe(defaultImgURL)
        expect(server.startDate).toBe(defaultTimeSQL)
    })
    it("throws an error if no server with id", async () => {
        try {
            await Server.get(5000)
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Create Server", () => {
    it("can create a new server", async () => {
        const newServer = await Server.create(
            {name:"new_server", pictureUrl:defaultImgURL})
        expect(newServer.id).toBe(4)
        expect(newServer.name).toBe("new_server")
        expect(newServer.picture_url).toBe(defaultImgURL)
    })
    it("doesn't create a server with a name of an existing server", async () => {
        try {
            await Server.create({name:"s1", pictureUrl:defaultImgURL})
            fail()
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Delete Server", () => {
    it("deletes a server", async () => {
        const server = await Server.delete(1)
        expect(server.name).toBe('s1')
    })
    it("throws an error if you try to delete a server that doesn't exist", async () => {
        try {
            await Server.delete(5000)
        }
        catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})

describe("Update Server", () => {
    const updatedServer = {name:"update server", pictureUrl:"newImage.jpg"}
    it("update a server", async () => {
        const server = await Server.update(1, updatedServer)
        expect(server.id).toBe(1)
        expect(server.name).toBe(updatedServer.name)
        expect(server.picture_url).toBe(updatedServer.pictureUrl)
    })
    it("throws an error if you try to update " +
        "a server that doesn't exist", async () => {
            try {
                await Server.update(5000, updatedServer)
            } catch (err) {
                expect(err instanceof Error).toBeTruthy()
            }
    })
})