import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login/Login";
import { AuthProvidor } from "./context/Auth";
import ProtectedRoute from "./Pages/ProtectedRoute/ProtectedRoute";
import DashBoard from "./Pages/DashBoard/DashBoard";
import Layout from "./Pages/Layout/Layout";
import Profile from "./Pages/Profile/Profile";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "dashboard",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <DashBoard />,
      },
      {
        path: "profile", // Removed leading slash
        element: <Profile />,
      },
    ],
  },
]);

function App() {
  return (
    <div className="App">
      <AuthProvidor>
        <RouterProvider router={router} />
      </AuthProvidor>
    </div>
  );
}

export default App;
