require("dotenv").config();

const auth = require("../auth");

const deleteAccount = require("../deleteAccount").deleteAccount;

const createUsers = require("../../../Utilities/accountUtilities").createUsers;

const mockDone = jest.fn((err, user, info) => {
  return null;
});

let users = [];

beforeAll(async () => {
  users = createUsers(
    3,
    "testPassword",
    "checkUserNameAndPassword",
    "checkUserNameAndPassword"
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

describe("checkUserNameAndPassword", () => {
  test("Existing User username and Correct Password", async () => {
    mockDone.mockClear();

    await auth.checkUsernameAndPassword(
      users[0].username,
      users[0].password,
      mockDone
    );

    expect(mockDone.mock.calls.length).toBe(1);
    expect(mockDone.mock.calls[0][0]).toBeNull();
    expect(mockDone.mock.calls[0][1]).toBeDefined();
    expect(mockDone.mock.calls[0][2].apiResult.error).toEqual("");
    expect(mockDone.mock.calls[0][2].apiResult.errorReason).toEqual("");
    expect(mockDone.mock.calls[0][2].apiResult.errorDetails).toEqual("");
  });

  test("Existing User email and Correct Password", async () => {
    mockDone.mockClear();

    await auth.checkUsernameAndPassword(
      users[0].email,
      users[0].password,
      mockDone
    );

    expect(mockDone.mock.calls.length).toBe(1);
    expect(mockDone.mock.calls[0][0]).toBeNull();
    expect(mockDone.mock.calls[0][1]).toBeDefined();
    expect(mockDone.mock.calls[0][2].apiResult.error).toEqual("");
    expect(mockDone.mock.calls[0][2].apiResult.errorReason).toEqual("");
    expect(mockDone.mock.calls[0][2].apiResult.errorDetails).toEqual("");
  });

  test("Username that does not exist", async () => {
    mockDone.mockClear();

    await auth.checkUsernameAndPassword(
      "NoSuchUserUserName",
      users[0].password,
      mockDone
    );

    expect(mockDone.mock.calls.length).toBe(1);
    expect(mockDone.mock.calls[0][0]).toBeNull();
    expect(mockDone.mock.calls[0][1]).toBeDefined();
    expect(mockDone.mock.calls[0][2].apiResult.error).toEqual("user_error");
    expect(mockDone.mock.calls[0][2].apiResult.errorReason).toEqual(
      "No user with that email/username found"
    );
    expect(mockDone.mock.calls[0][2].apiResult.errorDetails).toEqual("");
  });

  test("Incorrect password", async () => {
    mockDone.mockClear();

    await auth.checkUsernameAndPassword(
      users[0].email,
      users[0].password + "makeitatypo",
      mockDone
    );

    expect(mockDone.mock.calls.length).toBe(1);
    expect(mockDone.mock.calls[0][0]).toBeNull();
    expect(mockDone.mock.calls[0][1]).toBeDefined();
    expect(mockDone.mock.calls[0][2].apiResult.error).toEqual("user_error");
    expect(mockDone.mock.calls[0][2].apiResult.errorReason).toEqual(
      "Incorrect Password"
    );
    expect(mockDone.mock.calls[0][2].apiResult.errorDetails).toEqual("");
  });
});
