/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState, Fragment } from "react";
import AnimateHeight from "react-animate-height";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@reach/router";

import { colors, colorsUse, alternateBorders } from "../Css/Css";
import LogoIcon from "../Icons/LogoIcon.png";
import { useMedia } from "../UseMediaHook";
import { AppNavLinks } from "./AppNavLinks";
import React from 'react'
import {UserInterface} from "../User/User"

interface UserProps { user: UserInterface }

export function AppNavBar(props:UserProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const deviceSize = useMedia();

  return (
    <Fragment>
      <nav css={appNavBarContainerCss}>
        <Link to="/" css={logoContainerCss}>
          <img
            src={LogoIcon}
            style={{ height: 40, marginLeft: 10, color: "black" }}
            alt="Home Logo"
          />
          <div css={logoTextCss}>Quick Easy Database</div>
        </Link>
        {deviceSize === "extra_small" && props.user.isLoggedIn ? (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            css={navBarMenuButtonStyling}
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
        ) : (
          <div css={menuItemsContainerStyling}>
            <AppNavLinks
              {...props}
            />
          </div>
        )}
      </nav>
      {deviceSize === "extra_small" && props.user.isLoggedIn ? (
        <nav>
          <AnimateHeight height={menuOpen ? "auto" : 0}>
            <div css={hideableMenuContainerCss}>
              <AppNavLinks
                {...props}
              />
            </div>
          </AnimateHeight>
        </nav>
      ) : null}
    </Fragment>
  );
}
const logoContainerCss = css`
  display: flex;
  align-items: top;
  text-decoration: none;
`;

const logoTextCss = css`
  margin-left: 5px;
  color: ${colorsUse.defaultLink};
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-style: italic;
  font-weight: 800;
`;

const hideableMenuContainerCss = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid ${colors.DarkGrey};
  ${alternateBorders()};
`;

const appNavBarContainerCss = css`
  position: sticky;
  top: 0;
  left: 0;
  margin: auto;
  margin-top: 10px;
  display: flex;
  height: 40px;
  background-color: white;
  justify-content: space-between;
  align-items: top;
  ${alternateBorders()}
`;

const navBarMenuButtonStyling = css`
  color: ${colorsUse.defaultLink};
  margin-left: 10px;
  margin-right: 10px;
  height: 20px;
`;

const menuItemsContainerStyling = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: flex-start;
  margin-right: 10px;
  ${alternateBorders()};
`;
