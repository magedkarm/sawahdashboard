import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/Auth";
import { toast, ToastContainer } from "react-toastify";
import { MDBBtn, MDBIcon, MDBInput } from "mdb-react-ui-kit";
import "react-toastify/dist/ReactToastify.css";
import "./changePassword.css";

export default function ChangePassword() {
  const { token, setToken } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    setIsSaving(true);
    const payload = {
      passwordCurrent: currentPassword,
      password: newPassword,
      passwordConfirm: confirmPassword,
    };

    axios
      .patch("api/v1/users/updateMyPassword", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsSaving(false);

        // Set the new token
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem("token", newToken); // Store the new token in localStorage

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password updated successfully!");
      })
      .catch((error) => {
        setIsSaving(false);
        toast.error(error.response.data.message || "Error updating password");
        console.error("Error updating password:", error.response.data.message);
      });
  };

  return (
    <div className="change-password-page">
      <div className="sectionChange rounded-3 p-5 text-center">
        <h2>Change Password</h2>
        <div className="form-group">
          <label>Current Password</label>
          <div className="input-wrapper">
            <MDBInput
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              placeholder="Enter Current Password"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <MDBIcon
              fas
              icon={showCurrentPassword ? "eye-slash" : "eye"}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="password-toggle-icon"
            />
          </div>
        </div>
        <div className="form-group">
          <label>New Password</label>
          <div className="input-wrapper">
            <MDBInput
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              placeholder="Enter New Password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <MDBIcon
              fas
              icon={showNewPassword ? "eye-slash" : "eye"}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="password-toggle-icon"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <div className="input-wrapper">
            <MDBInput
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Confirm New Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <MDBIcon
              fas
              icon={showConfirmPassword ? "eye-slash" : "eye"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-icon"
            />
          </div>
        </div>
        <MDBBtn
          className="btn btn-success save-button"
          onClick={handleChangePassword}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Change Password"}
        </MDBBtn>
        <ToastContainer />
      </div>
    </div>
  );
}
