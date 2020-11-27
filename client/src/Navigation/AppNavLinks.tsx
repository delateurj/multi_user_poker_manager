/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Fragment } from "react";
import { Link } from "@reach/router";
import { useMedia } from "../UseMediaHook";
import { UserInterface } from "../User/User"
import React  from "react";

interface UserProps { user: UserInterface }

export function AppNavLinks(props:UserProps) {
  const deviceSize = useMedia();
  return (
    <Fragment>
      {props.user.isLoggedIn ? (
        <div css={navButtonCss(deviceSize)} onClick={props.user.handleLogout}>
          Log Out
        </div>
      ) : (
        <Fragment>
          <Link to="signup" css={navButtonCss(deviceSize)}>
            Sign Up
          </Link>
          <Link to="signin" css={navButtonCss(deviceSize)}>
            Sign In
          </Link>
        </Fragment>
      )}
    </Fragment>
  );
}

const navButtonCss = (deviceSize:string) => css`
  margin-left: 16px;
  margin-right: 5px;
  text-decoration: none;
  border: solid 1px blue;
  border-radius: 6px;
  font-size: ${deviceSize === "extra_small" ? "8px" : "18px"};
  width: ${deviceSize === "extra_small" ? "36px" : "72px"};
  height: ${deviceSize === "extra_small" ? "20px" : "32px"};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background: linear-gradient(
    131deg,
    #4c63b6 0%,
    rgba(104, 115, 154, 0.56) 100%
  );
`;
