const myPgConfig = require("./pgConfig").myPgConfig;
const adminPgConfig = require("./pgConfig").adminPgConfig;

pg = require("pg");

// //By default pg client returns all numerics as strings because
// //the precision of postgres is greater than what can be represented
// //in javascript/node floats.
// //This can lead to errors through concatenation where + is treated as concat instead
// //of arimthmetic.  The following forces the floats to be converted at the risk of loss of precision
// //and inaccurate results for large values or highly precise values.
// //This is not issue for the types of values this app will handle.
// //Alternative is judicous use of parseInt or Number in client and server code where
// //arimetic is done.

pg.types.setTypeParser(1700, "text", parseFloat);

var knexConfig = myPgConfig[process.env.NODE_ENV || "development"];

module.exports.knex = require("knex")(knexConfig);

module.exports.knexConfig = knexConfig;
