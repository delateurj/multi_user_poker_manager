const auth = require("../auth");

const mockLogIn = jest.fn((user, callBack) => {
  return null;
});

const mockStatus = jest.fn(status => {
  return mockStatusReturn;
});

const mockSend = jest.fn(body => {});

const mockStatusReturn = { send: mockSend };

describe("Custom Done Function for Passport Authenticate", () => {
  test("Error null and user not null", async () => {
    let err = null;
    let user = { not: "null" };
    let req = { logIn: mockLogIn };
    let res = { status: mockStatus, send: mockSend };

    await auth.customDone(err, user, null, req, res, null);

    expect(mockLogIn.mock.calls.length).toBe(1);
  });

  test("Error not null and user not null", async () => {
    let err = "error";
    let user = { not: "null" };
    let req = { logIn: mockLogIn };
    let res = { status: mockStatus, send: mockSend };
    let info = { info: "somedetails" };

    mockLogIn.mockClear();

    mockStatus.mockClear();
    mockSend.mockClear();
    await auth.customDone(err, user, info, req, res, null);

    expect(mockLogIn.mock.calls.length).toBe(0);
    expect(mockStatus.mock.calls.length).toBe(1);
    expect(mockStatus.mock.calls[0][0]).toBe(500);
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0]).toBe(info);
  });

  test("No User and No Error...means user error like bad password", async () => {
    let err = null;
    let user = null;
    let req = { logIn: mockLogIn };
    let res = { status: mockStatus, send: mockSend };
    let info = { info: "somedetails" };

    mockLogIn.mockClear();
    mockStatus.mockClear();
    mockSend.mockClear();

    await auth.customDone(err, user, info, req, res, null);

    expect(mockLogIn.mock.calls.length).toBe(0);
    expect(mockStatus.mock.calls.length).toBe(1);
    expect(mockStatus.mock.calls[0][0]).toBe(200);
    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0]).toEqual({
      apiResult: "failed_authentication",
      apiResultDetails: "Bad username/password combination"
    });
  });
});
