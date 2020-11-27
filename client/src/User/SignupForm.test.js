import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { SignupForm } from "./SignupForm";
import userEvent from "@testing-library/user-event";

const mockHandleSignup = jest.fn(() => {});

const user = { handleSignup: mockHandleSignup };

test("renders email, username and password inputs", () => {
  render(<SignupForm user={user} />);

  expect(
    screen.queryByRole("textbox", { name: /username/i })
  ).toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: /email/i })).toBeInTheDocument();
  expect(screen.queryByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/confirm password/i)).toBeInTheDocument();
});

test("validates required username", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<SignupForm user={user} />);

  userEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(screen.queryByText(/^Username is Required$/i)).toBeInTheDocument();
  });

  userEvent.type(screen.getByLabelText("Username"), "testUsername");

  userEvent.click(screen.getByText("Submit"));

  await waitForElementToBeRemoved(() =>
    screen.queryByText(/^Username is Required$/i)
  );
});

test("validates required email", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<SignupForm user={user} />);

  userEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(screen.queryByText(/^Email is Required$/i)).toBeInTheDocument();
  });

  userEvent.type(screen.getByLabelText("Email Address"), "test@test.com");

  userEvent.click(screen.getByText("Submit"));

  await waitForElementToBeRemoved(() =>
    screen.queryByText(/^Email is Required$/i)
  );
});

test("validates required password", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<SignupForm user={user} />);

  userEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(screen.queryByText(/^Password is Required$/i)).toBeInTheDocument();
  });

  userEvent.type(screen.getByLabelText("Password"), "test1@MUL");

  userEvent.click(screen.getByText("Submit"));

  await waitForElementToBeRemoved(() =>
    screen.queryByText(/^Password is Required$/i)
  );
});

test("validates password and confirm password match", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<SignupForm user={user} />);

  userEvent.type(screen.getByLabelText("Password"), "test1@MUL");

  userEvent.type(screen.getByLabelText("Confirm Password"), "test2@MUL");

  userEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(screen.queryByText(/^Passwords do not match$/i)).toBeInTheDocument();
  });

  userEvent.clear(screen.getByLabelText("Confirm Password"));

  userEvent.type(screen.getByLabelText("Confirm Password"), "test1@MUL");

  await waitForElementToBeRemoved(() =>
    screen.queryByText(/^Passwords do not match$/i)
  );
});

test("calls SignUpRequest on submit", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<SignupForm user={user} />);

  userEvent.type(screen.getByLabelText("Username"), "testUsername");

  userEvent.type(screen.getByLabelText("Email Address"), "test@test.com");

  userEvent.type(screen.getByLabelText("Password"), "test1@MUL");

  userEvent.type(screen.getByLabelText("Confirm Password"), "test1@MUL");

  userEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(mockHandleSignup).toHaveBeenCalledTimes(1);
  });

  expect(mockHandleSignup).toHaveBeenCalledWith(
    "test@test.com",
    "testUsername",
    "test1@MUL"
  );
});
