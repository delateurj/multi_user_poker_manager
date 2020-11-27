require("dotenv").config();
var app = require("./App");
var path = require("path");
var debug = require("debug")("witexpress:server");
var http = require("http");
var https = require("https");
const knex = require("./database/knex").knex;
const knexAdmin = require("./database/knex").knexAdmin;
const knexConfig = require("./database/knex").knexConfig;
const meta = require("./database/meta");
const sharedFunctions = require("./database/sharedFunctions");
const signUp = require("./routes/Authentication/auth").signUp;
var log = require("./logging/log").log;
var fs = require("fs");

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
var port = normalizePort(process.env.PORT || "3003");

let knexInfo = { ...knex.client.config.connection };
delete knexInfo.password;
log.info("Knex info", knexInfo);
//
//knex.migrate.latest();

async function connectDBAndStartListening() {
  let metaAlreadyExists = await knex.raw(`SELECT 1 FROM pg_catalog.pg_namespace
  WHERE nspowner <> 1 -- ignore tables made by postgres itself
  AND nspname = 'meta'`);

  if (metaAlreadyExists.rowCount === 0) {
    await meta.CreateAndPopulateMetaSchema();
  }
  await meta.CreateSharedFunctionsSchemaIfNotExists();

  await sharedFunctions.CreateOrReplaceSharedFunctions();

  if (process.env.DEFAULT_ADMIN_ACCOUNT_PASSWORD) {
    let adminEmailExists = await knex
      .withSchema("meta")
      .select("_id")
      .from("user")
      .where("email", process.env.DEFAULT_ADMIN_EMAIL);

    if (adminEmailExists.length == 0) {
      try {
        await signUp({
          email: process.env.DEFAULT_ADMIN_EMAIL,
          username: process.env.DEFAULT_ADMIN_USERNAME,
          password: process.env.DEFAULT_ADMIN_ACCOUNT_PASSWORD,
          role: "admin",
        });
      } catch (e) {
        log.error("Error creating default user:\n", e.message, "\n");
      }
    }
  } else {
    log.error(
      "No default password defined...will not attempt to create default account",
      "\n"
    );
    throw "No default account password defined";
  }
  try {
    let result = await knex.raw("select current_database()");
    let dbVersion = await knex.raw("select version()");
    log.info("Postgres Version: ", dbVersion.rows[0].version, "\n");
    let dbUser = await knex.raw("select user");
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);
  } catch (e) {
    log.error(
      "Connecting to DB's and starting up Failed with error message:",
      e.message,
      "\n"
    );
  }
}

connectDBAndStartListening().catch((error) => {
  console.log(error);
});

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
