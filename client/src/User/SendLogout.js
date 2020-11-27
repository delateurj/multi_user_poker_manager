import axios from "axios";

export async function SendLogout() {
  console.log("Sending signout");
  let logoutResponse = await axios.post("/auth/logout");
  console.log(logoutResponse);
  return logoutResponse;
}
