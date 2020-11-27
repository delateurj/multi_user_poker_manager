var connection = require("../database/knex");
var log = require("../logging/log").log;
const knex = connection.knex;
const sharedFunctions = require("./sharedFunctions");

async function DropAndCreateAccountTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("account");

    await knex.schema.withSchema("meta").createTable("account", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table
        .text("accountname")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating account table", e.message);
  }
}
module.exports.DropAndCreateAccountTable = DropAndCreateAccountTable;

async function DropAndCreateUserTables() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("user");

    await knex.schema.withSchema("meta").createTable("user", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table
        .text("email")
        .unique("No Duplicate Emails")
        .notNullable();
      table.text("username").unique("No Duplicate Usernames");
      table.text("password").notNullable();
      table.text("withings_userid");
      table.text("withings_access_token");
      table.text("withings_refresh_token");
      table.text("role");
      table.timestamp("withings_token_expiry");
      table.uuid("defaultapp_id");
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating user table", e.message);
  }
}
module.exports.DropAndCreateUserTables = DropAndCreateUserTables;

async function DropAndCreateUserTriggers() {
  try {
    let result = null;

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS CreateAppOnInsert ON meta.user;
       CREATE TRIGGER CreateAppOnInsert
       AFTER INSERT
         ON meta.user
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.CreateDefaultApp();
     `);

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS DeleteUserAppsOnDelete ON meta.user;
       CREATE TRIGGER DeleteUserApps
       Before delete
         ON meta.user
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.DeleteUserApps();
     `);

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS DeleteAppSchemaOnDelete ON meta.app;
       CREATE TRIGGER DeleteAppSchemaOnDelete
       Before delete
         ON meta.app
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.DeleteAppSchema();
     `);
  } catch (e) {
    console.log("Error creating user table triggers", e.message);
  }
}
module.exports.DropAndCreateUserTriggers = DropAndCreateUserTriggers;

async function DropAndCreateAppTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("app");

    await knex.schema.withSchema("meta").createTable("app", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table.text("name").notNullable();
      table.text("app_type");
      table
        .uuid("user_id")
        .references("_id")
        .inTable("meta.user")
        .onDelete("cascade");
      table.unique(["name", "app_type", "user_id"]);
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating app table", e.message);
  }
}
module.exports.DropAndCreateAppTable = DropAndCreateAppTable;

async function DropAndCreateAppTriggers() {
  try {
    let result = null;

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS CreateAppSchema ON meta.app;
       CREATE TRIGGER CreateAppSchema
       AFTER INSERT
         ON meta.app
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.CreateAppSchema();
     `);
  } catch (e) {
    console.log("Error creating app table triggers", e.message);
  }
}
module.exports.DropAndCreateAppTriggers = DropAndCreateAppTriggers;

async function DropAndCreateAppUserTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("appuser");

    await knex.schema.withSchema("meta").createTable("appuser", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("app_id")
        .references("_id")
        .inTable("meta.app")
        .onDelete("cascade");
      table
        .uuid("user_id")
        .references("_id")
        .inTable("meta.user")
        .onDelete("cascade");
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating app user table", e.message);
  }
}
module.exports.DropAndCreateAppUserTable = DropAndCreateAppUserTable;

async function DropAndCreatePermissionTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("permission");

    await knex.schema.withSchema("meta").createTable("permission", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table
        .text("name")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating permission table", e.message);
  }
}
module.exports.DropAndCreatePermissionTable = DropAndCreatePermissionTable;

async function DropAndCreateRoleTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("role");

    await knex.schema.withSchema("meta").createTable("role", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table
        .text("name")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating role table", e.message);
  }
}
module.exports.DropAndCreateRoleTable = DropAndCreateRoleTable;

async function DropAndCreateRolePermissionTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("rolepermission");

    await knex.schema
      .withSchema("meta")
      .createTable("rolepermission", table => {
        table
          .uuid("_id")
          .unique()
          .notNullable()
          .primary()
          .defaultTo(knex.raw("gen_random_uuid()"));
        table
          .uuid("role_id")
          .references("_id")
          .inTable("meta.role")
          .onDelete("cascade");
        table
          .uuid("permission_id")
          .references("_id")
          .inTable("meta.permission")
          .onDelete("cascade");
        table.timestamps(true, true);
      });
  } catch (e) {
    console.log("Error creating role permission table", e.message);
  }
}
module.exports.DropAndCreateRolePermissionTable = DropAndCreateRolePermissionTable;

async function DropAndCreateAppUserRoleTable() {
  try {
    await knex.schema.withSchema("meta").dropTableIfExists("appuserrole");

    await knex.schema.withSchema("meta").createTable("appuserrole", table => {
      table
        .uuid("_id")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("app_id")
        .references("_id")
        .inTable("meta.app")
        .onDelete("cascade");
      table
        .uuid("user_id")
        .references("_id")
        .inTable("meta.user")
        .onDelete("cascade");
      table
        .uuid("role_id")
        .references("_id")
        .inTable("meta.role")
        .onDelete("cascade");
      table.timestamps(true, true);
    });
  } catch (e) {
    console.log("Error creating app user role table", e.message);
  }
}
module.exports.DropAndCreateAppUserRoleTable = DropAndCreateAppUserRoleTable;

async function CreateAndPopulateMetaSchema() {
  try {
    log.info("Creating schema meta and populating", "\n");
    await knex.raw(`CREATE SCHEMA  meta`);

    await DropAndCreateAccountTable();

    await DropAndCreateUserTables();

    await DropAndCreateAppTable();

    await DropAndCreateAppUserTable();

    await DropAndCreateRoleTable();

    await DropAndCreatePermissionTable();

    await DropAndCreateRolePermissionTable();

    await DropAndCreateAppUserRoleTable();
  } catch (e) {
    log.error("!!!! Error creating meta tables", e.message, "\n");
  }
}
module.exports.CreateAndPopulateMetaSchema = CreateAndPopulateMetaSchema;

async function CreateSharedFunctionsSchemaIfNotExists() {
  log.info("Creating shared_functions schema if not exists", "\n");
  try {
    result = await knex.raw("CREATE SCHEMA IF NOT EXISTS shared_functions");

    return result;
  } catch (e) {
    log.error("!!!! Error creating meta tables", e.message, "\n");
  }
}
module.exports.CreateSharedFunctionsSchemaIfNotExists = CreateSharedFunctionsSchemaIfNotExists;
