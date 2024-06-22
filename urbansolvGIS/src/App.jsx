import { redirect, createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./pages/register";
import Home from "./pages/Home";
import MainLayout from "./components/mainLayout";
import Login from "./pages/login";
import Radius from "./pages/radius";
import User from "./pages/user";

const routes = createBrowserRouter([
  {
    element: <MainLayout />,
    // loader: () => {
    //   if (!localStorage.access_token) {
    //     return redirect("/login");
    //   }
    //   return null;
    // },
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/radius",
        element: <Radius />,
      },
      {
        path: "/user",
        element: <User />,
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
  return <RouterProvider router={routes} />;
}

export default App;
