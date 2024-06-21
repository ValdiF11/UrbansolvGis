import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCircle, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../config/firebase";
import Swal from "sweetalert2";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Logout Success!",
      });
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  return (
    <div className="d-flex flex-column align-items-center p-3" style={{ width: "14%", height: "100vh", backgroundColor: "#1a237e", color: "white" }}>
      <div className="mb-4 d-flex justify-content-center" style={{ width: "100%" }}>
        <img src="/logo.png" alt="Logo" className="img-fluid w-50 mx-auto" />
      </div>
      <div className="mb-4">
        <h4>WEB GISKU</h4>
      </div>
      <nav className="flex-grow-1">
        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <Link to="/" className="nav-link text-white">
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Dashboard
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/radius" className="nav-link text-white">
              <FontAwesomeIcon icon={faCircle} className="me-2" />
              Radius
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <Link to="/user" className="nav-link text-white">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              User
            </Link>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link text-white">
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
