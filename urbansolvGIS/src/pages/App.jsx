import { redirect, createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./pages/register";
import Home from "./pages/Home";
import MainLayout from "./components/mainLayout";
import Login from "./pages/login";
import Radius from "./pages/radius";
import { auth } from "../config/firebase";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/radius",
        element: <Radius />,
      },
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });

  return <RouterProvider router={router} user={user} />;
}

export default App;
