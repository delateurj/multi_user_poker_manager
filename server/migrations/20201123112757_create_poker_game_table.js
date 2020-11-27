exports.up = function (knex, Promise) {
  return knex.schema.withSchema("poker").createTable("game", function (t) {
    t.uuid("_id")
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    t.text("name").unique().notNullable();
    t.timestamps(true, true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.withSchema("poker").dropTableIfExists("game");
};
