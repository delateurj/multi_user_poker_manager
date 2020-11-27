import { render, screen, waitFor } from "@testing-library/react";
import { SigninForm } from "./SigninForm";
import userEvent from "@testing-library/user-event";

const mockHandleSignin = jest.fn(() => {});

const user = { handleSignin: mockHandleSignin };

test("renders email, username and password inputs", () => {
  render(<SigninForm />);

  expect(
    screen.queryByRole("textbox", { name: /username/i })
  ).toBeInTheDocument();
  expect(screen.queryByLabelText(/^password$/i)).toBeInTheDocument();
});

test("calls handleSignin on submit", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<SigninForm user={user} />);

  userEvent.type(screen.getByLabelText("Username"), "testUsername");

  userEvent.type(screen.getByLabelText("Password"), "test1@MUL");

  userEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(mockHandleSignin).toHaveBeenCalledTimes(1);
  });

  expect(mockHandleSignin).toHaveBeenCalledWith("testUsername", "test1@MUL");
});
