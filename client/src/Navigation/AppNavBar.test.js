import { AppNavBar } from "./AppNavBar";
import { render } from "@testing-library/react";
import matchMediaFix from "../Utilities/MatchMediaFix";

const user = { isLoggedIn: true };

test("Can render", () => {
  window.matchMedia = matchMediaFix;
  render(<AppNavBar user={user} />);
});
