


const intToColor = ( colorAsNumber ) => {

    const r = Math.floor( colorAsNumber / (256 ** 2) )
    const b = Math.floor( (colorAsNumber - r * 256 ** 2) / 256 )
    const g = colorAsNumber - r * 256 ** 2 - b * 256

    if( r > 256 || colorAsNumber < 0 ) throw Error("outside bounds")

    return {r,b,g}
}

const colorToInt = ( color ) => {

    if(
        color.r > 256 || color.r < 0 ||
        color.b > 256 || color.b < 0 ||
        color.g > 256 || color.g < 0
    ) throw Error("outside bounds")

    return color.r * 256**2 + color.b * 256 + color.g
}

module.exports = { intToColor, colorToInt }