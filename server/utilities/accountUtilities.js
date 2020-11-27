require("dotenv").config();

const auth = require("../routes/Authentication/auth");

function createUsers(numberOfUsers = 0, basePassword, baseUsername, baseEmail) {
  let users = [];

  for (let index = 0; index < numberOfUsers; index++) {
    let user = { password: "", username: "", email: "" };
    user.password = basePassword + index;
    user.username = baseUsername + index;
    user.email = baseEmail + index + "@test.com";
    users.push(user);
  }
  return users;
}
exports.createUsers = createUsers;
