import axios from "axios";

export async function SendSignup(email, username, password) {
  console.log("Send signup   called");
  const data = {
    values: { email: email, password: password, username: username },
  };
  try {
    let theResponse = await axios.post("/auth/signUp", data);
    return theResponse;
  } catch (e) {
    console.log(JSON.parse(JSON.stringify(e)));
    console.log(e.response);
    return e;
  }
}
