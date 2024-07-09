import React, { createContext, useContext, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { UserContext } from "./UserContext";
import { AuthContext } from "./Auth";

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const response = await axios.get("/api/v1/contact-us", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMessages(response.data.data.contactMessages);
    return response.data.data.contactMessages;
  };

  const { isLoading, isError } = useQuery("messages", fetchMessages);

  return (
    <MessagesContext.Provider
      value={{ messages, setMessages, isLoading, isError }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  return useContext(MessagesContext);
};
