import React from "react";
import { NavLink } from "react-router-dom";
import "../SideBar/SideBar.css";

export default function SideBar({ isCollapsed }) {
  return (
    <div className={`sideBar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sideBarContainer">
        <div className="sideBarMenu">
          <ul className="sideBarMenuUl">
            <li>
              <NavLink to="/panel/dashboard">
                <i className="fas fa-home"></i>
                <span className="nav-text">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/panel/landmarks">
                <i className="fa-solid fa-landmark"></i>
                <span className="nav-text">Landmark</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/panel/category">
                <i className="fa-solid fa-layer-group"></i>
                <span className="nav-text">Category</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/panel/tours">
                <i className="fa-solid fa-sailboat"></i>
                <span className="nav-text">Tours</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/panel/users">
                <i className="fas fa-user"></i>
                <span className="nav-text">Users</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/panel/admins">
                <i className="fa-solid fa-key"></i>
                <span className="nav-text">Admins</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/panel/guides">
                <i className="fa-solid fa-hand"></i>
                <span className="nav-text">Guides</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
