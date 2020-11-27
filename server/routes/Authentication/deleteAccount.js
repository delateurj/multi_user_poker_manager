var connection = require("../../database/knex");
const knex = connection.knex;
const promiseTimeout = require("../../utilities/promiseTimeout").promiseTimeout;

exports.deleteAccount = deleteAccount = async function (email) {
  // await promiseTimeout(simulatedDelay);
  console.log("deleting", email);

  try {
    let result = await knex("meta.user").where({ email: email }).del();
    return result;
  } catch (e) {
    log.error(e.message, "Error in deleting account, rethrowing");
    throw e;
  }
};
