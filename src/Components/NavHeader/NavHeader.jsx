import Hamburger from "hamburger-react";
import React from "react";
import { Link } from "react-router-dom";

export default function NavHeader({ onToggleSidebar }) {
  return (
    <div className="nav-header">
      <Link to="/dashboard" className="h-100">
        <img
          src={require("../../assets/mainlogo.png")}
          className="w-100 h-100"
          alt=""
        />
      </Link>
      <div className="nav-control">
        <Hamburger
          rounded
          onToggle={(toggled) => {
            onToggleSidebar(toggled);
          }}
        />
      </div>
    </div>
  );
}
