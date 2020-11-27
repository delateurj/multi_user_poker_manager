import { render } from "@testing-library/react";
import App from "./App";
import matchMediaFix from "./Utilities/MatchMediaFix";

test("renders", () => {
  window.matchMedia = matchMediaFix;
  render(<App />);
});
