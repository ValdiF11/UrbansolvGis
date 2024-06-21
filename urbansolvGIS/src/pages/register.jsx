import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { auth, db } from "../config/firebase";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          name: name,
          username: username,
          email: email,
        });
      }
      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Register Success!",
      });
      navigate("/login");
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
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
        <div className="container h-100 " style={{ position: "relative", zIndex: 1 }}>
          <div className="row h-100 align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="my-5 display-3 fw-bold ls-tight">Innovative Web GIS Solutionss</h1>
              <p style={{ color: "hsl(217, 10%, 50.8%)" }}>
                Discover the power of Geographic Information Systems (GIS) to transform your business operations. Our web-based GIS tools provide
                robust solutions for data visualization, spatial analysis, and decision-making. Join us to leverage cutting-edge technology in your
                projects.
              </p>
            </div>
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="card">
                <div className="card-body py-5 px-md-5">
                  <form
                    onSubmit={handleRegister}
                    // onSubmit={async function register(event) {
                    //   event.preventDefault();
                    //   try {
                    //     setLoading(true);
                    //     let response = await axios({
                    //       method: "POST",
                    //       url: "http://localhost:3000/user/register",
                    //       data: {
                    //         name: name,
                    //         username: username,
                    //         email: email,
                    //         password: password,
                    //       },
                    //     });
                    //     setLoading(false);
                    //     Swal.fire({
                    //       icon: "success",
                    //       title: "Success",
                    //       text: "Register Success!",
                    //     });
                    //     navigate("/login");
                    //   } catch (error) {
                    //     setLoading(false);
                    //     Swal.fire({
                    //       icon: "error",
                    //       title: "Error",
                    //       text: error.response.data.message,
                    //     });
                    //   }
                    // }}
                  >
                    {/* Name Input */}
                    <div className="form-outline mb-4">
                      <label className="form-label" htmlFor="form3Example1">
                        Name
                      </label>
                      <input type="text" id="form3Example1" className="form-control" value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                    {/* Username Input */}
                    <div className="form-outline mb-4">
                      <label className="form-label" htmlFor="form3Example1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="form3Example1"
                        className="form-control"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                      />
                    </div>
                    {/* Email input */}
                    <div className="form-outline mb-4">
                      <label className="form-label" htmlFor="form3Example3">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="form3Example3"
                        className="form-control"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    {/* Password input */}
                    <div className="form-outline mb-4">
                      <label className="form-label" htmlFor="form3Example4">
                        Password
                      </label>
                      <input
                        type="password"
                        id="form3Example4"
                        className="form-control"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                    {/* Submit button */}
                    <div className="d-flex justify-content-center">
                      <button type="submit" className="btn btn-primary btn-block mb-4 w-100">
                        Sign up
                      </button>
                    </div>
                    <p className="text-center">
                      Already have an account? <Link to="/login">Login</Link>
                    </p>
                    {/* Register buttons */}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Jumbotron */}
      </section>
      {/* Section: Design Block */}
    </>
  );
};

export default Register;
