"use strict";

/** Express app for Cacophony */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { NotFoundError } = require("./expressError");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const serversRoutes = require("./routes/servers");
const { authenticateJWT } = require("./middleware/auth");
const updateLastOn = require("./helpers/updateLastOn");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use((req, res, next) => {
    try {
        console.log(req.body)
        return next()
    } catch (err) {
        return next(err)
    }
})

app.use("/auth", authRoutes)
app.use(authenticateJWT)
app.use(updateLastOn)

app.use("/users", usersRoutes)
app.use("/servers", serversRoutes)


// the two error handlers below were lifted from the express-jobly project
/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {

    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status? err.status : 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app