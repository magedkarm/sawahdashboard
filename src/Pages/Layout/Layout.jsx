import React from "react";
import "../Layout/Layout.css";

import { Dropdown, Collapse, initMDB } from "mdb-ui-kit";
import NavHeader from "../../Components/NavHeader/NavHeader";
import Header from "../../Components/Header/Header";
import SideBar from "./../../Components/SideBar/SideBar";
import { Outlet } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";

initMDB({ Dropdown, Collapse });

export default function Layout() {
  return (
    <div className="layout">
      <NavHeader />
      <Header />
      <SideBar />
      <div className="content-body overflow-hidden">
        <div className="container-fluid pt-4 px-4 overflow-hidden">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
