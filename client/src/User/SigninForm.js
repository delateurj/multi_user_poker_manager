/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { css, jsx } from "@emotion/core";
import { palette } from "../Css/Css";

export const SigninForm = (props) => {
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },

    validationSchema: Yup.object({
      username: Yup.string().required("Username is Required"),
      password: Yup.string().required("Password is Required"),
    }),
    onSubmit: (values) => {
      props.user.handleSignin(values.username, values.password);
    },
  });

  return (
    <Fragment>
      <div data-testid={"SigninComponent"} css={signinContainerCSS}>
        <div css={logInHeadlineCss}>Sign In For This Multi User App </div>
        <form onSubmit={formik.handleSubmit} css={formCss}>
          <label css={inputLabelCss} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            {...formik.getFieldProps("username")}
            css={inputCss}
          />
          {formik.touched.username && formik.errors.username ? (
            <label htmlFor="username" css={inputErrorCss}>
              {formik.errors.username}
            </label>
          ) : null}
          <label css={passwordLabelCss} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            {...formik.getFieldProps("password")}
            css={inputCss}
          />
          {formik.touched.password && formik.errors.password ? (
            <div css={inputErrorCss}>{formik.errors.password}</div>
          ) : null}
          <button css={signinButtonCss} type="submit">
            <div css={signinButtonTextCss}>Submit</div>
          </button>
        </form>
      </div>
    </Fragment>
  );
};

const signinContainerCSS = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const signinButtonCss = css`
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

const signinButtonTextCss = css`
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
