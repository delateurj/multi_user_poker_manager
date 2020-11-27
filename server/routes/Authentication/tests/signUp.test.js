require("dotenv").config();

const request = require("supertest");

const auth = require("../auth");

const createUsers = require("../../../Utilities/accountUtilities").createUsers;

const deleteAccount = require("../deleteAccount").deleteAccount;

let users = [];

beforeAll(async () => {
  users = createUsers(
    3,
    "testPassword",
    "apiAuthIntTestUser",
    "apiAuthIntTestUser"
  );

  for (let index = 0; index < users.length; index++) {
    try {
      await deleteAccount(users[index].email);
    } catch (e) {
      console.log("failed delete", e);
    }
  }

  for (let index = 0; index < users.length; index++) {
    await auth.signUp(Object.assign({}, users[index]));
  }
  return 1;
});

afterAll(async () => {
  for (let index = 0; index < users.length; index++) {
    await deleteAccount(users[index].email);
  }
  return 1;
});

let requestHandler = request.agent("http://localhost:3003");

function expectSuccessfulLogin(res, loginUsed) {
  expect(res.body).toHaveProperty("role");
  expect(res.body.role).toBeNull();

  expect(res.body).toHaveProperty("emailOrUsername");
  expect(res.body.emailOrUsername).toBe(users[0][loginUsed]);
  expect(res.body).toHaveProperty("_id");
  expect(res.body.email).not.toBeNull();

  expect(res.body).toHaveProperty("app_id");
  expect(res.body.email).not.toBeNull();

  expect(res.body).toHaveProperty("apps");
  expect(res.body.apps).not.toBeNull();
  expect(res.body.apps[0].name).toMatch(/your first app/i);

  expect(res.body).toHaveProperty("apiResult");
  expect(res.body.apiResult).toHaveProperty("error");
  expect(res.body.apiResult.error).toBeFalsy();
}

describe("Auth API Integration Test", () => {
  test("Can login with correct email and password", async () => {
    let res = await requestHandler
      .post("/auth/login")
      .send({ emailOrUsername: users[0].email, password: users[0].password });

    expectSuccessfulLogin(res, "email");

    let checkIfLoggedIn = await requestHandler.post("/auth/checkIfLoggedIn");

    expect(checkIfLoggedIn.body.isLoggedIn).toBe(true);
  });

  test("Can login with just username and password", async () => {
    let res = await requestHandler.post("/auth/login").send({
      emailOrUsername: users[0].username,
      password: users[0].password,
    });

    expectSuccessfulLogin(res, "username");

    let checkIfLoggedIn = await requestHandler.post("/auth/checkIfLoggedIn");

    expect(checkIfLoggedIn.body.isLoggedIn).toBe(true);
  });

  test("Check logged in fails after logout and protected routes fail", async () => {
    let res = await requestHandler.post("/auth/login").send({
      emailOrUsername: users[0].username,
      password: users[0].password,
    });

    expectSuccessfulLogin(res, "username");

    expectSuccessfulLogin(res, "username");

    let checkIfLoggedIn = await requestHandler.post("/auth/checkIfLoggedIn");

    expect(checkIfLoggedIn.body.isLoggedIn).toBe(true);

    let logOutRes = await requestHandler.post("/auth/logOut");

    checkIfLoggedIn = await requestHandler.post("/auth/checkIfLoggedIn");

    expect(checkIfLoggedIn.body.isLoggedIn).toBeFalsy();
    expect(checkIfLoggedIn.body.role).toBe(null);

    let protectedRes = await requestHandler.post("/auth/deleteAccount");
    expect(protectedRes.status).toBe(401);

    protectedRes = await requestHandler.post("/api");
    expect(protectedRes.status).toBe(401);

    protectedRes = await requestHandler.post("/withings");
    expect(protectedRes.status).toBe(401);

    protectedRes = await requestHandler.post("/withings/getWithingsJWT");
    expect(protectedRes.status).toBe(401);

    protectedRes = await requestHandler.post("/logs");
    expect(protectedRes.status).toBe(401);
  });
});
