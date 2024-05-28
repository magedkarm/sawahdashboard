import React, { useContext } from "react";

import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (token === null && localStorage.getItem("token") === null) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}
