import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login/Login";
import { AuthProvidor } from "./context/Auth";
import ProtectedRoute from "./Pages/ProtectedRoute/ProtectedRoute";
import DashBoard from "./Pages/DashBoard/DashBoard";
import Layout from "./Pages/Layout/Layout";
import Profile from "./Pages/Profile/Profile";
import Users from "./Pages/Users/Users";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import Admins from "./Pages/Admins/Admins";
import Guides from "./Pages/Guides/Guides";
const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "panel",
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
        path: "profile",
        element: <Profile />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "admins",
        element: <Admins />,
      },
      {
        path: "guides",
        element: <Guides />,
      },
      {
        path: "charts",
        element: <Profile />,
      },
    ],
  },
]);
let clientQuery = new QueryClient();
function App() {
  return (
    <div className="App">
      <QueryClientProvider client={clientQuery}>
        <AuthProvidor>
          <RouterProvider router={router} />
        </AuthProvidor>
      </QueryClientProvider>
      <Toaster />
    </div>
  );
}

export default App;
