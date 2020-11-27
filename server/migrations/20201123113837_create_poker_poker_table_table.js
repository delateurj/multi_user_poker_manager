exports.up = function (knex, Promise) {
  return knex.schema
    .withSchema("poker")
    .createTable("game_table", function (t) {
      t.uuid("_id")
        .references("_id")
        .inTable("poker.game")
        .onDelete("cascade")
        .unique()
        .notNullable()
        .primary()
        .defaultTo(knex.raw("gen_random_uuid()"));
      t.text("name").unique().notNullable();
      t.timestamps(true, true);
    });
};

exports.down = function (knex, Promise) {
  return knex.schema.withSchema("poker").dropTableIfExists("game_table");
};
