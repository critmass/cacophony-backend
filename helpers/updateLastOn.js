const User = require("../database_models/User")

const updateLastOn = async (req, res, next) => {
    try {
        if (res.locals.user) await User.updateLastOn(res.locals.user.id)
        return next()
    } catch (err) {
        next(err)
    }
}

module.exports = updateLastOn