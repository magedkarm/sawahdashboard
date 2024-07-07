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
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingComponent from "../../Components/LoadingComponent/LoadingComponent";

export default function Guides() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const queryClient = useQueryClient();

  const getAllGuides = async () => {
    const response = await axios.get("/api/v1/users", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    console.log("API Response Data:", response.data.data.docs);
    return response.data.data.docs.filter((user) => user.role === "guide");
  };

  const { data, isLoading, error } = useQuery("allGuides", getAllGuides);

  const deleteGuideMutation = useMutation(
    (userId) =>
      axios.delete(`api/v1/users/${userId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    {
      onSuccess: () => {
        toast.success("Guide deleted successfully!", {
          position: "top-center",
        });
        queryClient.invalidateQueries("allGuides");
        handleDeleteClose();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  const handleDeleteOpen = (guide) => {
    setSelectedGuide(guide);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedGuide(null);
  };

  const handleDeleteConfirm = () => {
    deleteGuideMutation.mutate(selectedGuide._id);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const visibleRows = data
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

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
      <div className="Guides">
        <div className="pageTitles">
          <h3>
            Panel /{" "}
            <span
              style={{ fontSize: "20px", fontWeight: "400", color: "#87898b" }}
            >
              Guides
            </span>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">All Guides</h4>
              <Button variant="contained" color="primary">
                Add New Guide <i className="ps-3 fa-solid fa-plus"></i>
              </Button>
            </div>
            <div className="card-body">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Index</TableCell>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Email</TableCell>
                      <TableCell align="center">Photo</TableCell>
                      <TableCell align="center">Email Verified</TableCell>
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
                            color="secondary"
                            onClick={() => {
                              // Add your update handler here
                            }}
                            style={{ marginRight: "8px" }}
                          >
                            Update
                          </Button>
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
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={data.length}
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
        <DialogTitle id="alert-dialog-title">{"Delete Guide"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the guide "{selectedGuide?.name}"?
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
