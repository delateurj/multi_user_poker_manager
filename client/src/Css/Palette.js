import { css } from "@emotion/core";
import { palette } from "./Css";
import { hex2contrast } from "@csstools/convert-colors";

export function Palette(props) {
  let theSwatches = [];
  Object.entries(palette).forEach((element) => {
    let swatchSection = [<div css={{ marginTop: "10px" }}>{element[0]}</div>];
    Object.entries(palette).forEach((second) => {
      if (hex2contrast(element[1], second[1]) > 3) {
        swatchSection.push(
          <div
            css={{
              backgroundColor: element[1],
              margin: "10px",
              fontSize: "18px",
              color: second[1],
            }}
          >
            {second[0]} : {hex2contrast(element[1], second[1]).toFixed(1)}
          </div>
        );
      }
    });
    theSwatches.push(<div>{swatchSection}</div>);
  });
  return <div css={paletteContainerCss}>{theSwatches}</div>;
}

const paletteContainerCss = css`
  display: flex;
  flex-wrap: wrap;
`;
