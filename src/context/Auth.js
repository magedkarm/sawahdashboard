import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvidor({ children }) {
  const [token, setToken] = useState(null);

  useEffect(
    function () {
      if (localStorage.getItem("token") !== null) {
        setToken(localStorage.getItem("token"));
      }
    },
    [token]
  );
  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
