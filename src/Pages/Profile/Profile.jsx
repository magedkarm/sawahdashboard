import React, { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { AuthContext } from "../../context/Auth";
import Dropzone from "react-dropzone";
import axios from "axios";
import { toast } from "react-toastify";

import "./profile.css";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [photo, setPhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setPhoto(null);
  };

  const handleSaveClick = () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    if (photo) {
      formData.append("photo", photo);
    }

    axios
      .patch("api/v1/users/updateMe", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data.data.user);
        setIsEditing(false);
        setIsSaving(false);
        toast.success("Profile updated successfully!");
      })
      .catch((error) => {
        setIsSaving(false);
        toast.error("Error updating profile!");
        console.error("Error updating user data:", error);
      });
  };

  const handleDrop = (acceptedFiles) => {
    setPhoto(acceptedFiles[0]);
  };

  return (
    <div className="profile-page">
      {user ? (
        <>
          <div className="profile-header">
            {isEditing ? (
              <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="dropzone profile-photo">
                    <input {...getInputProps()} />
                    {photo ? (
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Profile Preview"
                        className="profile-photo-preview"
                      />
                    ) : (
                      <i className="fas fa-upload upload-icon"></i>
                    )}
                  </div>
                )}
              </Dropzone>
            ) : (
              <img src={user.photo} alt="Profile" className="profile-photo" />
            )}
            {isEditing ? (
              <input
                type="text"
                className="edit-name-input"
                value={name}
                placeholder="Enter New Name"
                onChange={(e) => setName(e.target.value)}
              />
            ) : null}
            {isEditing ? (
              <div className="Actionprofile d-flex justify-content-around mt-5">
                <button
                  className="btn btn-success save-button"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-danger cancel-button "
                  onClick={handleCancelClick}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button className="edit-button" onClick={handleEditClick}>
                <i className="fas fa-edit"></i> Edit
              </button>
            )}
          </div>
          {!isEditing && (
            <div className="profile-details">
              <h3>Profile Details</h3>
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
