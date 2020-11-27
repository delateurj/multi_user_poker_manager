/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { AppNavBar } from "./Navigation/AppNavBar";
import { useUser } from "./User/User";
import { alternateBorders } from "./Css/Css";
import { Router } from "@reach/router";
import { SignupForm } from "./User/SignupForm";
import { SigninForm } from "./User/SigninForm";
import React from "react";

export default function App() {
  const user = useUser();

  return (
    <div css={appContainerCss}>
      <AppNavBar css={pageContainerCss} user={user} />
      <Router>
        <SignupForm user={user} path="signup" />
        <SigninForm user={user} path="signin" />
      </Router>
    </div>
  );
}
const appContainerCss = css`
  ${alternateBorders()}
`;

const pageContainerCss = css`
  padding: 5px;
  margin: 1rem;
`;
