import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Box,
  TableSortLabel,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingComponent from "../../Components/LoadingComponent/LoadingComponent";

export default function Users() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(""); // State for selected role
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" }); // State for sorting
  const queryClient = useQueryClient();

  const getAllUsers = async () => {
    const response = await axios.get("/api/v1/users", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    console.log("API Response Data:", response.data.data.docs);
    return response.data.data.docs;
  };

  const { data, isLoading, error } = useQuery("allUsers", getAllUsers);

  const deleteUserMutation = useMutation(
    (userId) =>
      axios.delete(`api/v1/users/${userId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    {
      onSuccess: () => {
        toast.success("User deleted successfully!", {
          position: "top-center",
        });
        queryClient.invalidateQueries("allUsers");
        handleDeleteClose();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteConfirm = () => {
    deleteUserMutation.mutate(selectedUser._id);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setPage(0); // Reset to the first page when filtering
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (sortConfig.key) {
      return data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const filteredData = data
    ? data.filter((user) => !selectedRole || user.role === selectedRole)
    : [];

  const visibleRows = sortedData(filteredData).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading)
    return (
      <>
        <LoadingComponent />
      </>
    );
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <>
      <ToastContainer />
      <div className="users">
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
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">All Users</h4>
              <Button variant="contained" color="primary">
                Add New User <i className="ps-3 fa-solid fa-plus"></i>
              </Button>
              <FormControl variant="outlined" style={{ minWidth: 200 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  <MenuItem value="">
                    <em>All Roles</em>
                  </MenuItem>
                  {data &&
                    [...new Set(data.map((user) => user.role))].map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            <div className="card-body">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">
                        <TableSortLabel
                          active={sortConfig.key === "index"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("index")}
                        >
                          Index
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortConfig.key === "name"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("name")}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortConfig.key === "email"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("email")}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortConfig.key === "role"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("role")}
                        >
                          Role
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Photo</TableCell>
                      <TableCell align="center">
                        <TableSortLabel
                          active={sortConfig.key === "emailVerified"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("emailVerified")}
                        >
                          Email Verified
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((row, ind) => (
                      <TableRow
                        key={row._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row" align="left">
                          {page * rowsPerPage + ind + 1}
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">{row.role}</TableCell>
                        <TableCell align="center">
                          <img
                            src={row.photo}
                            className="rounded"
                            alt={row.name}
                            height="100"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {row.emailVerified ? "Yes" : "No"}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteOpen(row)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={7} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete User"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the user "{selectedUser?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
