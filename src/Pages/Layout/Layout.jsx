import React, { useEffect, useState } from "react";
import "../Layout/Layout.css";

import { Dropdown, Collapse, initMDB } from "mdb-ui-kit";
import NavHeader from "../../Components/NavHeader/NavHeader";
import Header from "../../Components/Header/Header";
import SideBar from "./../../Components/SideBar/SideBar";
import { Outlet } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";

initMDB({ Dropdown, Collapse });

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = (toggled) => {
    setIsSidebarCollapsed(toggled);
  };

  useEffect(() => {}, [isSidebarCollapsed]);

  return (
    <div className="layout">
      <NavHeader onToggleSidebar={handleToggleSidebar} />
      <Header />
      <SideBar isCollapsed={isSidebarCollapsed} />
      <div
        className={`content-body ${
          isSidebarCollapsed ? "content-body-collapsed" : ""
        }`}
      >
        <div className="container-fluid pt-4 px-4 overflow-hidden position-relative h-auto">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
