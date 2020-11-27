exports.up = function (knex, Promise) {
  return knex.schema
    .withSchema("poker")
    .createTable("player_hand", function (t) {
      t.uuid("_id")
        .references("_id")
        .inTable("poker.hand")
        .onDelete("cascade")
        .references("_id")
        .inTable("poker.player")
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
  return knex.schema.withSchema("poker").dropTableIfExists("player_hand");
};
