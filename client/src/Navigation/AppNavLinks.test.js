import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppNavLinks } from "./AppNavLinks";
import matchMediaFix from "../Utilities/MatchMediaFix";

window.matchMedia = matchMediaFix;

const mockHandleLogout = jest.fn(() => {});

const user = { handleLogout: mockHandleLogout, isLoggedIn: true };

test("Shows Signup and Sign In Options if not logged in", async () => {
  render(<AppNavLinks user={{ isLoggedIn: false }} />);
  expect(screen.getByText("Sign Up")).toBeInTheDocument();
  expect(screen.getByText("Sign In")).toBeInTheDocument();
  expect(screen.queryByText("Log Out")).toBeNull();
});

test("Shows Log Out if logged in", async () => {
  render(<AppNavLinks user={{ isLoggedIn: true }} />);
  expect(screen.getByText("Log Out")).toBeInTheDocument();
});

test("click Signup takes you to /signup", async () => {
  render(<AppNavLinks user={{ isLoggedIn: false }} />);

  userEvent.click(screen.getByText("Sign Up"));

  await waitFor(() => {
    expect(window.location.pathname).toBe("/signup");
  });
});

test("click Signin takes you to /signin form", async () => {
  render(<AppNavLinks user={{ isLoggedIn: false }} />);
  userEvent.click(screen.getByText("Sign In"));

  await waitFor(() => {
    expect(window.location.pathname).toBe("/signin");
  });
});

test("Calls handle sign log out when log out clicked", async () => {
  render(<AppNavLinks user={user} />);
  expect(screen.getByText("Log Out")).toBeInTheDocument();
  userEvent.click(screen.getByText("Log Out"));
  await waitFor(() => {
    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });
});
