import React, { useState } from "react";
import {
  Container,
  Col,
  Row,
  Card,
  Form,
  Button,
  Image,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { Formik, FormikValues } from "formik";
import * as Yup from "yup";
import { LoginData } from "../objectTypes";
import { logIn } from "../api/session";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import AggieButton from "../components/AggieButton";

const loginFormSchema = Yup.object().shape({
  loginUsername: Yup.string().required("Username required"),
  loginPassword: Yup.string().required("Password required"),
});

interface IProps {}

const Login = (props: IProps) => {
  let navigate = useNavigate();
  const queryClient = useQueryClient();
  const loginQuery = useMutation(
    (logInData: LoginData) => {
      return logIn(logInData);
    },
    {
      onSuccess: (data) => {
        //reload website to check for session in root
        navigate(0);
      },
      onError: (data) => {},
    }
  );
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const formValuesToLogin = (values: FormikValues) => {
    return {
      username: values.loginUsername,
      password: values.loginPassword,
    };
  };
  return (
    <main
      className='grid place-items-center h-[100svh]'
      style={{
        background: "linear-gradient(to bottom right, #2D9242, #0d6efd)",
      }}
    >
      <section className='rounded-lg bg-white shadow-xl mb-24 p-4'>
        <div className='flex justify-center text-[#416B34]'>
          <div>
            <svg
              fill='none'
              viewBox='0 0 62 62'
              className='w-24 h-24   px-2 rounded-lg'
            >
              <path
                d='M31 39a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm15-15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-4-14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 29a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-43 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm30 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14-28a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-43 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm16 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z'
                fill='currentColor'
              />
            </svg>

            <h2 className={"mb-3 mt-1 text-center text-xl font-medium"}>
              AGGIE
            </h2>
          </div>
        </div>
        <Alert show={loginQuery.isError} variant={"danger"}>
          <span>
            {
              "Your username and password combination was not correct, please try again."
            }
          </span>
        </Alert>
        <Formik
          initialValues={{ loginUsername: "", loginPassword: "" }}
          validationSchema={loginFormSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            loginQuery.mutate(formValuesToLogin(values), {
              onSuccess: (data) => queryClient.invalidateQueries(["session"]),
            });
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId='loginForm.formUsername' className={"mb-3"}>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  type='text'
                  placeholder='Username'
                  name='loginUsername'
                  onChange={handleChange}
                  value={values.loginUsername}
                />
              </Form.Group>
              <Form.Group controlId='loginForm.formPassword' className={"mb-3"}>
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type={passwordVisibility ? "text" : "password"}
                    placeholder='Password'
                    name='loginPassword'
                    onChange={handleChange}
                    value={values.loginPassword}
                    spellCheck={false}
                    autoCorrect={"off"}
                    autoCapitalize={"off"}
                    autoComplete={"loginPassword"}
                  />
                  <Button
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                  >
                    {passwordVisibility ? (
                      <FontAwesomeIcon icon={faEyeSlash} />
                    ) : (
                      <FontAwesomeIcon icon={faEye} />
                    )}
                  </Button>
                </InputGroup>
              </Form.Group>
              {/* {(errors.loginUsername || errors.loginPassword) && (
                <div className='border border-red-300 text-red-800 bg-red-100 rounded px-2 py-1 text-sm mb-1'>
                  no username or password
                </div>
              )} */}

              <div className='flex justify-end'>
                {/* <Button variant='link'>Forgot your username?</Button> */}
                <AggieButton
                  variant='primary'
                  type='submit'
                  disabled={loginQuery.isLoading}
                >
                  Sign in
                </AggieButton>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </main>
  );
};

export default Login;
