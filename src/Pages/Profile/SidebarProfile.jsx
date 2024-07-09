import React, { useContext } from "react";
import { AuthContext } from "../../context/Auth";
import "./SidebarProfile.css";

export default function SidebarProfile({ activeTab, setActiveTab }) {
  const { logOut } = useContext(AuthContext);

  const handleLogOut = () => {
    logOut();
  };

  return (
    <div className="sidebarProfile">
      <button
        className={`sidebar-button ${activeTab === "profile" ? "active" : ""}`}
        onClick={() => setActiveTab("profile")}
      >
        <i className="fas fa-user icon"></i> Profile
      </button>
      <button
        className={`sidebar-button ${
          activeTab === "changePassword" ? "active" : ""
        }`}
        onClick={() => setActiveTab("changePassword")}
      >
        <i className="fas fa-key icon"></i> Change Password
      </button>
      <button className="sidebar-button" onClick={handleLogOut}>
        <i className="fas fa-sign-out-alt icon"></i> Log Out
      </button>
    </div>
  );
}
