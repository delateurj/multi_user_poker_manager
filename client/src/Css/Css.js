/**@jsx jsx */
/* stylelint-disable */

import { css } from "emotion";
import styled from "@emotion/styled";
export const palette = {
  Color_Alert_0: "#610316",
  Color_Alert_1: "#8a041a",
  Color_Alert_2: "#ab091e",
  Color_Alert_3: "#cf1124",
  Color_Alert_4: "#e12d39",
  Color_Alert_5: "#ef4e4e",
  Color_Alert_6: "#f86a6a",
  Color_Alert_7: "#ff9b9b",
  Color_Alert_8: "#ffbdbd",
  Color_Alert_9: "#ffe3e3",
  Color_Grey_0: "#1f2933",
  Color_Grey_1: "#323f4b",
  Color_Grey_2: "#3e4c59",
  Color_Grey_3: "#52606d",
  Color_Grey_4: "#616e7c",
  Color_Grey_5: "#7b8794",
  Color_Grey_6: "#9aa5b1",
  Color_Grey_7: "#cbd2d9",
  Color_Grey_8: "#e4e7eb",
  Color_Grey_9: "#f5f7fa",
  Color_Positive_0: "#3ebd93",
  Color_Positive_1: "#65d6ad",
  Color_Positive_2: "#8eedc7",
  Color_Positive_3: "#c6f7e2",
  Color_Positive_4: "#effcf6",
  Color_Primary_0: "#192f6b",
  Color_Primary_1: "#2d3a8c",
  Color_Primary_2: "#35469c",
  Color_Primary_3: "#4055a8",
  Color_Primary_4: "#4c63b6",
  Color_Primary_5: "#647acb",
  Color_Primary_6: "#7b93db",
  Color_Primary_7: "#98aeeb",
  Color_Primary_8: "#bed0f7",
  Color_Primary_9: "#e0e8f9",
  Color_Warn_0: "#8d2b0b",
  Color_Warn_1: "#b44d12",
  Color_Warn_2: "#cb6e17",
  Color_Warn_3: "#de911d",
  Color_Warn_4: "#f0b429",
  Color_Warn_5: "#f7c948",
  Color_Warn_6: "#fadb5f",
  Color_Warn_7: "#fce588",
  Color_Warn_8: "#fff3c4",
  Color_Warn_9: "#fffbea",
};

export const colors = {
  LogoColor: "#034bc7",
  DarkPrimary: "#034bc7",
  //DarkPrimary: "#0048cf",
  LightPrimary: "#50a3e3",
  DarkGrey: "#2d3436",
  LightGrey: "#b2bec3",
  MediumGrey: "#5a5a5a",
  AnotherMedium: "#bfbfbf",
  GettingRidiculous: "#8c8c8c",
  VeryLight: "#f1f2f2",
  OhMy: "#107db0",
  PleaseStop: "#59b7e3",
  Ooof: "#004c6f",
  Ugh: "#2ba9e3",

  Blue: "#368cbf",
  Green: "#20c933",
  //Green: "#7ebc59",
  //Green: "#00C1A7",
  Slate: "#33363b",
  Grey: "#eaeaea",
  Orange: "#bf8836",
  Red: "#bf4436",
};
/* @color-primary-0: #034CC7;	 Main Primary color 
@color-primary-1: #3175E9;
@color-primary-2: #0D61EF;
@color-primary-3: #023997;
@color-primary-4: #022C75;

@color-secondary-1-0: #2804CC;	 Main Secondary color (1) 
@color-secondary-1-1: #5837EA;
@color-secondary-1-2: #3A11F0;
@color-secondary-1-3: #1F039D;
@color-secondary-1-4: #18037A;

@color-secondary-2-0: #00C1A7;	/* Main Secondary color (2) 
@color-secondary-2-1: #1DE6CB;
@color-secondary-2-2: #00EDCC;
@color-secondary-2-3: #008F7B;
@color-secondary-2-4: #006E5F; */

const debugBorderColors = ["green", "purple", "red", "blue", "black"];

export function alternateBorders(turnOnDebugBorders = false) {
  if (turnOnDebugBorders) {
    if (typeof alternateBorders.colorIndex == "undefined") {
      alternateBorders.colorIndex = 0;
    } else {
      alternateBorders.colorIndex =
        (alternateBorders.colorIndex + 1) % debugBorderColors.length;
    }
    return `border: 2px solid ${
      debugBorderColors[alternateBorders.colorIndex]
    };`;
  } else return ``;
}

export const colorsUse = {
  defaultLink: colors.DarkPrimary,
  activeLink: colors.MediumGrey,
};

export const NormalizeCSS = css`
  *,
  *::after,
  *::before {
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
    height: 100%;
    background-color: white;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: Lato;
    /*...
      reset to default size after
      the 62.5% trick above to get 1em=px*/
    font-size: 1.6rem;
    /*...
      Golden ratio... some say is good..some start with 1, some with
      auto, some with 1.1.*/
    line-height: 1.62;
    min-height: 100%;
    max-width: 960px;
    width: 100%;
    margin-right: auto;
    margin-left: auto;
  }
`;

export const ButtonResetCss = css`
  ${NormalizeCSS}
  padding: 0;
  border: none;
  color: inherit;
  background-color: transparent;
  /*...
     show a hand cursor on hover; some argue that we
    should keep the default arrow cursor for buttons */
  cursor: pointer;
  outline: none;
  :-moz-focus-inner {
    border: none;
  }
`;

export const BaseStyledButtonCss = css`
  ${ButtonResetCss}
  border-radius: 0.4rem;
  padding: 0.1rem 0.2rem 0.1rem 0.2rem;
  margin: 1rem 0rem 1rem 0rem;
  color: ${colors.MediumGrey};
  font-weight: 600;
  border: solid 2px ${colors.LightGrey};

  :focus {
    background: ${colors.LightGrey};
  }

  :hover {
    background: ${colors.Grey};
  }

  :active {
    position: relative;
    background: white;
    top: 1px;
    left: 1px;
  }
`;
export const ButtonCSSReset = styled.button`
  padding: 0;
  border: none;
  font: inherit;
  color: inherit;
  background-color: transparent;
  /*...
     show a hand cursor on hover; some argue that we
    should keep the default arrow cursor for buttons */
  cursor: pointer;
  outline: none;
  :-moz-focus-inner {
    border: none;
  }
  :focus:not(.focus-visible) {
    box-shadow: none;
  }
`;

export const DataFormStyledLabel = styled.label`
  color: ${colors.DarkPrimary};
  font-size: 1.5rem;
  padding: 0.1rem 0.2rem 0.1rem 0.2rem;
  margin-left: 1rem;
`;

export const BaseStyledButton = styled(ButtonCSSReset)`
  border-radius: 0.4rem;
  padding: 0.1rem 0.2rem 0.1rem 0.2rem;
  margin: 1rem 0 1rem 0;
  color: ${colors.MediumGrey};
  font-weight: 600;
  border: solid 2px ${colors.LightGrey};
  :hover {
    background: ${colors.Grey};
  }

  :active {
    position: relative;
    background: white;
    top: 1px;
    left: 1px;
  }
`;

export const StyledLabel = styled.label`
  display: flex;
  color: ${colors.DarkPrimary};
  flex-direction: column;
`;

export const StyledInput = styled.input`
  color: ${colors.DarkGrey};
  border: 1px solid ${colors.LightGrey};
  border-radius: 6px;
  padding: 1rem;
`;
