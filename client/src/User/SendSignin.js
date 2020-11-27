import axios from "axios";

export async function SendSignin(username, password) {
  const data = {
    type: "Login",
    emailOrUsername: username,
    password: password,
  };
  try {
    let theResponse = await axios.post("/auth/login", data);
    return theResponse;
  } catch (e) {
    console.log("Login error", JSON.stringify(e));
    return e;
  }
}
