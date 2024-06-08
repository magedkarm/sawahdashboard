import React, { useContext, useState } from "react";
import "../Login/Login.css";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Hourglass } from "react-loader-spinner";
import { AuthContext } from "../../context/Auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext); // Renamed to avoid conflict
  const navigate = useNavigate();

  async function submitLogin(values) {
    setLoading(true);
    try {
      const { data } = await axios.post("api/v1/users/login", values);
      if (data.status) {
        if (data?.data.user.role === "user") {
          setErrorMsg("You Are Not Admin");
          setLoading(false);
        } else {
          console.log(data.status);
          localStorage.setItem("token", data.token);
          setErrorMsg(null);
          authContext.setToken(data.token);
          setSuccessMsg("Successfully logged in");
          setTimeout(() => {
            navigate("/panel");
          }, 1000);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setSuccessMsg(null);
      setLoading(false);
      setErrorMsg(error.response?.data?.message || "An error occurred");
    }
  }

  const validationSchema = Yup.object({
    email: Yup.string().required("email is required").email("email not valid"),
    password: Yup.string()
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, " password not match")
      .required("password is required"),
  });

  let formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: submitLogin,
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <div className="loginPage position-relative pt-5">
      <div className="headerLogin ">
        <div className="bgOverlay"></div>
        <div className="shape">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1440 120"
          >
            <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z" />
          </svg>
        </div>
      </div>
      <div className="loginForm z-2 position-relative text-center text-white pt-5">
        <div className="container">
          <div className="row">
            <div className="topLoginForm">
              <h2>Sawah</h2>
              <p>Admin & Dashboard</p>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="card mt-5">
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h6 className="text-primary">Welcome Back !</h6>
                    <p className="text-muted">Sign in to continue to Sawah.</p>
                  </div>
                  <div className="p-2 mt-4">
                    <form className="formField" onSubmit={formik.handleSubmit}>
                      {errorMsg ? (
                        <div className="alert alert-danger">{errorMsg}</div>
                      ) : (
                        ""
                      )}
                      {successMsg ? (
                        <div className="alert alert-success">{successMsg}</div>
                      ) : (
                        ""
                      )}

                      <TextField
                        className="formField"
                        id="outlined-required email"
                        name="email"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        label="Email"
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="error">{formik.errors.email}</div>
                      )}
                      <FormControl
                        sx={{
                          mt: 5,
                        }}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                      >
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <OutlinedInput
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.password}
                          error={
                            formik.touched.password &&
                            Boolean(formik.errors.password)
                          }
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          }
                          label="Password"
                        />
                        {formik.touched.password && formik.errors.password && (
                          <div className="error">{formik.errors.password}</div>
                        )}
                      </FormControl>
                      <button
                        type="submit"
                        className="tp-btn w-100 border-0 text-center btnSubmit "
                      >
                        {loading ? (
                          <Hourglass
                            visible={true}
                            height="40"
                            width="40"
                            ariaLabel="hourglass-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            colors={["#fff", "#FFF"]}
                          />
                        ) : (
                          "Login"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
