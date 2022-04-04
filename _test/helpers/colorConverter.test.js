const { colorToInt, intToColor } = require("../../helpers/colorConverter")

const RED_INT     = 255*256**2
const RED_OBJ     = {r:255, b:0, g:0}
const BLUE_INT    = 255*256
const BLUE_OBJ    = {r:0, b:255, g:0}
const GREEN_INT   = 255
const GREEN_OBJ   = {r:0, b:0, g:255}


describe("Convert Color Object to Integer", () => {
    it("can convert a color to an integer", () => {
        expect(colorToInt(  RED_OBJ)).toBe(  RED_INT)
        expect(colorToInt( BLUE_OBJ)).toBe( BLUE_INT)
        expect(colorToInt(GREEN_OBJ)).toBe(GREEN_INT)
    })
    it("throws an error if r above of the range 255", () => {
        try {
            colorToInt({r:5000, b:0, g:0})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if g above of the range 255", () => {
        try {
            colorToInt({r:0, b:0, g:5000})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if b above of the range 255", () => {
        try {
            colorToInt({r:0, b:5000, g:0})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if r below of the range 0", () => {
        try {
            colorToInt({r:-5, b:0, g:0})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if g below of the range 0", () => {
        try {
            colorToInt({r:0, b:0, g:-4})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if b below of the range 0", () => {
        try {
            colorToInt({r:0, b:-5, g:0})
        } catch (err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})


describe("Convert Integer to Color Object", () => {
    it("can convert an integer to a color", () => {
        expect(intToColor(  RED_INT)).toEqual(  RED_OBJ)
        expect(intToColor( BLUE_INT)).toEqual( BLUE_OBJ)
        expect(intToColor(GREEN_INT)).toEqual(GREEN_OBJ)
    })
    it("throws an error if integer provided is too big", () => {
        const tooBigNumber = RED_INT + BLUE_INT + GREEN_INT + 1
        try {
            intToColor(tooBigNumber)
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if integer provided is negative", () => {
        try {
            intToColor(-1)
        }
        catch(err) {
            expect(err instanceof Error).toBeTruthy()
        }
    })
})