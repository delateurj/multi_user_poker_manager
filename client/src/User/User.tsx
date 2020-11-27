import { navigate } from "@reach/router";
import { useState } from "react";
import { SendSignup } from "./SendSignup";
import { SendLogout } from "./SendLogout";
import { SendSignin } from "./SendSignin";


interface handleSignupInterface {
  (email:string, username: string, password: string ): Promise<void>
}

interface handleLogoutInteface {
  ():void
}

interface handleSigninInteface {
  (username:string, password:string):void
}

interface testPropsInterface { p: string }


interface testInterface {
  (p:testPropsInterface):string
}

export let test : testInterface

test = function (p: testPropsInterface) {
  return "hello " + p.p;
}

console.log(test({ p: "world" }));

export interface UserInterface {
    handleSignup:handleSignupInterface,
    handleLogout: handleLogoutInteface,
    handleSignin: handleSigninInteface,
    email:string,
    username:string,
    isLoggedIn: boolean,
}
 
export function useUser() {
  
  const [user, setUser] = useState({
    handleSignup,
    handleLogout,
    handleSignin,
    email: "",
    username:"",
    isLoggedIn: false,
  });
  
    async function handleSignup( email:string,username: string, password: string) {
    let signupResult = await SendSignup(email, username, password);

    if (signupResult.status === 200) {
      setUser({ ...user, email: email, username: username, isLoggedIn: true });
      navigate("/");
    }
  }

  async function handleSignin(username:string, password:string) {
    let signinResult = await SendSignin(username, password);
    if (signinResult.status === 200) {
      setUser({ ...user, ...signinResult.data, isLoggedIn: true });
      navigate("/");
    }
  }

  async function handleLogout() {
    let logoutResult = await SendLogout();

    if (logoutResult.status === 200) {
      setUser({ ...user, email: "", username: "", isLoggedIn: false });
      navigate("/");
    }
  }

  return user;
}
