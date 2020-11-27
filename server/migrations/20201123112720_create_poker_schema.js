exports.up = function (knex, Promise) {
  return knex.raw("CREATE SCHEMA IF NOT EXISTS poker");
};

exports.down = function (knex, Promise) {
  return knex.raw("DROP SCHEMA IF EXISTS poker");
};
