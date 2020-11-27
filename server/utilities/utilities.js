const util = require("util");

function consoleFullObject(object) {
  console.log(
    util.inspect(
      object,
      true /*Include hidden*/,
      null /*full depth*/,
      true /* enable colors */
    )
  );
}

exports.consoleFullObject = consoleFullObject;
