import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App";

import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000/";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
