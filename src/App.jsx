import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login/Login";
import { AuthProvider } from "./context/Auth"; // Corrected AuthProvider spelling
import ProtectedRoute from "./Pages/ProtectedRoute/ProtectedRoute";
import DashBoard from "./Pages/DashBoard/DashBoard";
import Layout from "./Pages/Layout/Layout";
import Users from "./Pages/Users/Users";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
import Admins from "./Pages/Admins/Admins";
import Guides from "./Pages/Guides/Guides";
import Category from "./Pages/Category/Category";
import Landmarks from "./Pages/Landmarks/Landmarks";
import Tours from "./Pages/Tours/Tours";
import { UserProvider } from "./context/UserContext";
import { MessagesProvider } from "./context/MessagesContext";
import MainProfile from "./Pages/Profile/MainProfile";
import PageNotFound from "./Pages/PageNotFound/PageNotFound ";

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
        path: "dashboard",
        element: <DashBoard />,
      },
      {
        path: "landmarks",
        element: <Landmarks />,
      },
      {
        path: "tours",
        element: <Tours />,
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
        path: "category",
        element: <Category />,
      },
      {
        path: "profile",
        element: <MainProfile />,
      },
      { path: "*", element: <PageNotFound /> },
    ],
  },
]);

let clientQuery = new QueryClient();

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={clientQuery}>
        <AuthProvider>
          <UserProvider>
            <MessagesProvider>
              <RouterProvider router={router} />
            </MessagesProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
      <ToastContainer />
    </div>
  );
}

export default App;
