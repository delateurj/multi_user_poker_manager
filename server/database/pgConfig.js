var fs = require("fs");

var myPgConfig = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER_DEV,
      password: process.env.DB_PASSWORD_DEV,
      database: process.env.DB_DATABASENAME_DEV,
      searchPath: ["public"],
    },
  },
  test: {
    client: "pg",
    connection: {
      //debug: true,
      host: process.env.DB_HOST,
      user: process.env.DB_USER_TEST,
      password: process.env.DB_PASSWORD_TEST,
      database: process.env.DB_DATABASENAME_TEST,
      searchPath: ["public"],
    },
  },

  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER_PROD,
      password: process.env.DB_PASSWORD_PROD,
      database: process.env.DB_DATABASENAME_PROD,
      searchPath: ["public"],
      //ssl: true
    },
  },
};

module.exports = { myPgConfig };
