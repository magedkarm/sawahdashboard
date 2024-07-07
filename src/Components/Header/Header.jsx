import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <div className="header">
        <div className="header-content">
          <nav className="navbar navbar-expand-lg   w-100">
            <div className="container-fluid">
              <div className="header-left">dashboard</div>

              <div className="header-right d-flex align-items-center">
                {/* Icon */}
                <Link className=" text-reset me-5" to="#">
                  <i className="fa-regular fa-message"></i>
                </Link>

                <div className="dropdown">
                  <Link
                    data-mdb-dropdown-init
                    className="text-reset me-5 dropdown-toggle hidden-arrow"
                    to="#"
                    id="navbarDropdownMenuLink"
                    role="button"
                    aria-expanded="false"
                  >
                    <i className="fas fa-bell  position-relative">
                      <span className="badge-not badge rounded-pill badge-notification bg-danger">
                        1
                      </span>
                    </i>
                  </Link>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="navbarDropdownMenuLink"
                  >
                    <li>
                      <Link className="dropdown-item" to="#">
                        Some news
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Another news
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Something else here
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="dropdown">
                  <Link
                    data-mdb-dropdown-init
                    className="dropdown-toggle d-flex align-items-center hidden-arrow"
                    to="#"
                    id="navbarDropdownMenuAvatar"
                    role="button"
                    aria-expanded="false"
                  >
                    <img
                      src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
                      className="rounded-circle"
                      height={45}
                      alt="Black and White Portrait of a Man"
                      loading="lazy"
                    />
                  </Link>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="navbarDropdownMenuAvatar"
                  >
                    <li>
                      <Link className="dropdown-item" to="#">
                        My profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Logout
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Container wrapper */}
          </nav>
          {/* Navbar */}
        </div>
      </div>
    </>
  );
}
