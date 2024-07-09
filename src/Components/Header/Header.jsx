import React, { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { useMessages } from "../../context/MessagesContext";
import {
  Avatar,
  Badge,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/Auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user } = useContext(UserContext) || {}; // Default to empty object if context is undefined
  const { token } = useContext(AuthContext); // Get the token from AuthContext
  const { messages, setMessages, isLoading, isError } = useMessages();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const unseenCount = messages.filter((message) => !message.seen).length;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/v1/contact-us/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use the token from AuthContext
        },
      });
      // Remove the deleted message from the state
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
      setAnchorEl(null); // Close the menu after deletion
      toast.success("Message deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete message.");
    }
  };

  const handleAvatarClick = () => {
    navigate("/panel/profile"); // Navigate to the profile page
  };

  const renderUserAvatar = () => {
    if (user && user.photo) {
      return <Avatar src={user.photo} alt={user.name} />;
    } else if (user && user.name) {
      return <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>;
    } else {
      return (
        <Avatar
          src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
          alt="Default Avatar"
        />
      );
    }
  };

  const renderMessagesDropdown = () => {
    return (
      <>
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          sx={{ fontSize: 32, marginRight: 2 }} // Adjust the fontSize for larger icon and add margin
        >
          <Badge
            badgeContent={unseenCount}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "red", // Change the color of the badge
                color: "white", // Change the text color of the badge
              },
            }}
          >
            <MessageIcon sx={{ fontSize: 32 }} />{" "}
            {/* Adjust the fontSize for larger icon */}
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              maxHeight: "none", // Ensure the Menu itself doesn't have a max height
              width: "400px",
            },
          }}
        >
          {isLoading && <MenuItem>Loading...</MenuItem>}
          {isError && <MenuItem>Error loading messages</MenuItem>}
          {!isLoading && !isError && messages.length === 0 && (
            <MenuItem>No messages</MenuItem>
          )}
          <Box sx={{ maxHeight: "240px", overflowY: "auto" }}>
            {!isLoading &&
              !isError &&
              messages.map((message) => (
                <MenuItem
                  key={message._id}
                  onClick={() => handleDeleteMessage(message._id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      padding: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {message.firstName} {message.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {message.email}
                      </Typography>
                    </Box>
                    <Divider
                      component="div"
                      sx={{ height: "2px", margin: "8px 0" }}
                    />
                    <Typography
                      variant="body2"
                      color="textPrimary"
                      sx={{ paddingLeft: "16px" }}
                    >
                      {message.message}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
          </Box>
        </Menu>
      </>
    );
  };

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand-lg w-100">
          <div className="container-fluid">
            <div className="header-left">dashboard</div>

            <div className="header-right d-flex align-items-center">
              {/* Messages Dropdown */}
              {renderMessagesDropdown()}

              <IconButton color="inherit" onClick={handleAvatarClick}>
                {renderUserAvatar()}
              </IconButton>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
