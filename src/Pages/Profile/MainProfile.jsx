// src/components/Main.js
import React, { useState } from "react";

import Profile from "./Profile";
import ChangePassword from "./ChangePassword";

import SidebarProfile from "./SidebarProfile";
import { Helmet } from "react-helmet";

export default function MainProfile() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <div className="pageTitles">
        <h3>
          Panel /{" "}
          <span
            style={{ fontSize: "20px", fontWeight: "400", color: "#87898b" }}
          >
            Users
          </span>
        </h3>
      </div>
      <div className=" bg-white p-5 rounded-3 shadow-lg w-100">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">All Users</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <SidebarProfile
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                  <div className="col-md-9">
                    {activeTab === "profile" && <Profile />}
                    {activeTab === "changePassword" && <ChangePassword />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
