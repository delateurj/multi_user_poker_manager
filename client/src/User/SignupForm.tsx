/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { css, jsx } from "@emotion/core";
import { palette } from "../Css/Css";
import { alternateBorders } from "../Css/Css";
import { UserInterface } from "../User/User"
import React  from "react";


export const SignupForm = (props:{ user: UserInterface, path:string }) => {
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter valid email address")
        .required("Email is Required"),
      username: Yup.string().required("Username is Required"),
      password: Yup.string().required("Password is Required"),
      confirmPassword: Yup.string()
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
    }),
    onSubmit: (values) => {
      props.user.handleSignup(values.email, values.username, values.password);
    },
  });

  return (
    <Fragment>
      <div data-testid={"SignUpComponent"} css={signUpContainerCSS}>
        <div css={logInHeadlineCss}>Sign Up For This Multi User App </div>
        <form onSubmit={formik.handleSubmit} css={formCss}>
          <label css={inputLabelCss} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...formik.getFieldProps("username")}
            css={inputCss}
          />
          {formik.touched.username && formik.errors.username ? (
            <label htmlFor="username" css={inputErrorCss}>
              {formik.errors.username}
            </label>
          ) : null}
          <label css={inputLabelCss} htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...formik.getFieldProps("email")}
            css={inputCss}
          />
          {formik.touched.email && formik.errors.email ? (
            <label htmlFor="email" css={inputErrorCss}>
              {formik.errors.email}
            </label>
          ) : null}
          <label css={passwordLabelCss} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...formik.getFieldProps("password")}
            css={inputCss}
          />
          {formik.touched.password && formik.errors.password ? (
            <div css={inputErrorCss}>{formik.errors.password}</div>
          ) : null}
          <label css={inputLabelCss} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...formik.getFieldProps("confirmPassword")}
            css={inputCss}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div css={inputErrorCss}>{formik.errors.confirmPassword}</div>
          ) : null}
          <button css={signUpButtonCss} type="submit">
            <div css={signUpButtonTextCss}>Submit</div>
          </button>
        </form>
      </div>
    </Fragment>
  );
};

const signUpContainerCSS = css`
  ${alternateBorders()};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const signUpButtonCss = css`
  background-color: #e6e6e6;
  margin-top: 35px;
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: ${palette.Color_Grey_8};
  border: 1px solid ${palette.Color_Primary_4};
  border-radius: 4px;
  width: 296px;
  height: 46px;
`;

const signUpButtonTextCss = css`
  color: ${palette.Color_Primary_4};
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-weight: 500;
  font-size: 16px;
`;

const inputLabelCss = css`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  color: ${palette.Color_Primary_4};
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-weight: 500;
  font-size: 16px;
  border: none;
`;
const inputErrorCss = css`
  display: flex;
  flex-direction: column;
  color: red;
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-weight: 500;
  font-size: 16px;
  border: none;
`;

const inputCss = css`
  padding: 8px;
  width: 296px;
  color: black;
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-weight: 500;
  font-size: 16px;
  border: none;
  border: 1px solid #a1a1a1;
`;

const passwordLabelCss = css`
  ${inputLabelCss}
  margin-top: 15px;
  color: ${palette.Color_Primary_4};
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-weight: 500;
`;
const formCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const logInHeadlineCss = css`
  margin-top: 40px;
  font-size: 22px;
  color: ${palette.Color_Primary_4};
  font-family: Inter, monospace, Arial, Helvetica, sans-serif;
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  text-align: center;
`;
