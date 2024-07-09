import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./Auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios
        .get("/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data.data.doc);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
