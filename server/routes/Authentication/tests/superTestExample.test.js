const request = require("supertest");

describe("Super Test Example", () => {
  test("Super test test", async () => {
    // Doing request.agent(app) makes session cookies persist vs. just request(app)
    //However there is a bug where even this won't work if you have multiple cookies being set
    //There are work arounds available via google by getting cookies from header, parsing then setting
    //on subsequest requests.
    let requestHandler = request.agent("http://localhost:3003");
    let data = {
      emailOrUsername: "",
      email: "",
      password: ""
    };
    let res = await requestHandler.post("/auth/login").send(data);

    expect(res.status).toBe(200);

    expect(res.body.apiResult).toBe("failed_authentication");
  });
});
