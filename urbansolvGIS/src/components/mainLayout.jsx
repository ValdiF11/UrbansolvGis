import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";

export default function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user ? user : null);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user.uid));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <>
      <div className="d-flex " style={{ backgroundColor: "#0d47a1", color: "white" }}>
        <Sidebar />
        <div className="flex-grow-1">
          <div className="container-fluid max-h-100">
            <div className="row vh-100">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
