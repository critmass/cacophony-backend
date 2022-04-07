"use strict";

/** Shared config for application; can be required many places.
 *
 * The contents of this file are borrowed heavily from an earlier
 * project "Express-Jobly"
*/

const password = process.env.DATABASE_URL ? "" : require("./password")

require("dotenv").config();
require("colors");



const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var,
// production database
function getDatabaseUri() {
    return (process.env.NODE_ENV === "test")
        ? `postgresql://postgres:${password}@localhost/cacophony_test`
        : process.env.DATABASE_URL ||
        `postgresql://postgres:${password}@localhost/cacophony`
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 12 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Cacophony Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
};
