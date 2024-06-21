import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //   const [input, setInput] = useState("");
  //   const [isEmail, setIsEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log(user);
      localStorage.access_token = `Bearer ${user.accessToken}`;
      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Login Success!",
      });
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  };

  return (
    <>
      {/* Section: Design Block */}
      <section
        className="vh-100 d-flex align-items-center"
        style={{ backgroundImage: "url('/Login.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div
          className="overlay"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        ></div>
        {/* Jumbotron */}
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="card">
                <div className="card-body py-5 px-md-5">
                  <form
                    onSubmit={handleSubmit}
                    // onSubmit={async function login(event) {
                    //   event.preventDefault();
                    //   try {
                    //     setLoading(true);
                    //     let response;
                    //     if (isEmail) {
                    //       response = await axios({
                    //         method: "POST",
                    //         url: "http://localhost:3000/user/login",
                    //         data: {
                    //           email: input,
                    //           password: password,
                    //         },
                    //       });
                    //     } else {
                    //       response = await axios({
                    //         method: "POST",
                    //         url: "http://localhost:3000/user/login",
                    //         data: {
                    //           username: input,
                    //           password: password,
                    //         },
                    //       });
                    //     }
                    //     Swal.fire({
                    //       icon: "success",
                    //       title: "Success",
                    //       text: "Login Success!",
                    //     });
                    //     setLoading(false);
                    //     localStorage.access_token = response.data.access_token;
                    //     navigate("/");
                    //   } catch (error) {
                    //     setLoading(false);
                    //     Swal.fire({
                    //       icon: "error",
                    //       title: "Oops...",
                    //       text: error.response.data.message || error.message,
                    //     });
                    //   }
                    // }}
                  >
                    {/* Username/Email Input */}
                    <div className="form-outline mb-4">
                      {/* <label className="form-label" htmlFor="loginUsernameEmail">
                        Username or Email
                      </label>
                      <input
                        type="text"
                        id="loginUsernameEmail"
                        className="form-control"
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          if (e.target.value.includes("@")) {
                            setIsEmail(true);
                          } else {
                            setIsEmail(false);
                          }
                        }}
                      /> */}
                      <label className="form-label" htmlFor="email">
                        Email
                      </label>
                      <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    {/* Password input */}
                    <div className="form-outline mb-4">
                      <label className="form-label" htmlFor="loginPassword">
                        Password
                      </label>
                      <input
                        type="password"
                        id="loginPassword"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {/* Submit button */}
                    <div className="d-flex justify-content-center">
                      {loading ? (
                        <button type="submit" className="btn btn-primary btn-block mb-4 w-100" disabled>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-primary btn-block mb-4 w-100">
                          Log in
                        </button>
                      )}
                    </div>
                    <p className="text-center">
                      Didnt Have Account? <Link to="/register">Register</Link>
                    </p>
                    {/* Register buttons */}
                  </form>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-5 mb-lg-0" style={{ position: "relative", zIndex: 1 }}>
              <h1 className="my-5 display-3 fw-bold ls-tight">
                Welcome Back <br />
                <span className="text-primary">Log in to your account</span>
              </h1>
              <p style={{ color: "hsl(217, 10%, 50.8%)" }}>
                Access your account to manage your projects, explore new features, and stay updated with the latest advancements in web GIS
                technology. We're glad to have you back!
              </p>
            </div>
          </div>
        </div>
        {/* Jumbotron */}
      </section>
      {/* Section: Design Block */}
    </>
  );
};

export default Login;
