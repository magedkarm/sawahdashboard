import React, { forwardRef, useState } from "react";
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
} from "@mui/material";
import { styled, css } from "@mui/system";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Modal as BaseModal } from "@mui/base/Modal";
import { useFormik } from "formik";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingComponent from "../../Components/LoadingComponent/LoadingComponent";

export default function Category() {
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUpdatePreview, setImageUpdatePreview] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setImagePreview(null);
  };

  const handleUpdateOpen = (category) => {
    setSelectedCategory(category);
    setUpdateOpen(true);
  };
  const handleUpdateClose = () => {
    setUpdateOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteOpen = (category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedCategory(null);
  };

  const getAllCategories = async () => {
    const response = await axios.get("api/v1/categories");
    return response.data;
  };

  const { data, isLoading, error } = useQuery(
    "allCategories",
    getAllCategories
  );

  const deleteMutation = useMutation(
    (categoryId) =>
      axios.delete(`api/v1/categories/${categoryId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    {
      onSuccess: () => {
        toast.success("Category deleted successfully!", {
          position: "top-center",
        });
        queryClient.invalidateQueries("allCategories");
        handleDeleteClose();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  const mutation = useMutation(
    (newCategory) => {
      const formData = new FormData();
      formData.append("name", newCategory.name);
      formData.append("imageCover", newCategory.imageCover);

      return axios.post("api/v1/categories", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        toast.success("Category added successfully!", {
          position: "top-center",
        });
        queryClient.invalidateQueries("allCategories");
        handleClose();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, updatedCategory }) => {
      const formData = new FormData();
      formData.append("name", updatedCategory.name);
      formData.append("imageCover", updatedCategory.imageCover);

      return axios.patch(`api/v1/categories/${id}`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        toast.success("Category updated successfully!", {
          position: "top-center",
        });
        queryClient.invalidateQueries("allCategories");
        handleUpdateClose();
        setImageUpdatePreview(null);
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );
  const updateFormik = useFormik({
    initialValues: {
      name: selectedCategory?.name || "",
      imageCover: imageUpdatePreview,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      updateMutation.mutate({
        id: selectedCategory._id,
        updatedCategory: values,
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      imageCover: null,
    },
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("imageCover", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdateFileChange = (event) => {
    const file = event.currentTarget.files[0];
    updateFormik.setFieldValue("imageCover", file);
    setImagePreview(URL.createObjectURL(file));
  };
  async function getcategotyDetails(id) {
    try {
      const { data: categoryDetails } = await axios.get(
        `api/v1/categories/${id}`,
        {}
      );
      setImageUpdatePreview(categoryDetails?.data.doc.imageCover);
      setImagePreview(categoryDetails?.data.doc.imageCover);
    } catch (e) {
      console.log(e);
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - data.data.docs.length)
      : 0;

  const visibleRows = data
    ? data.data.docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
      <div className="landmark">
        <div className="pageTitles">
          <h3>
            Panel /{" "}
            <span
              style={{ fontSize: "20px", fontWeight: "400", color: "#87898b" }}
            >
              Category
            </span>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">All Categories</h4>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Add Category <i className="ps-3 fa-solid fa-plus"></i>
              </Button>
            </div>
            <div className="card-body">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Index</TableCell>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Image</TableCell>
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
                        <TableCell align="center">
                          <img
                            src={row.imageCover}
                            className="rounded"
                            alt={row.name}
                            height="100"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                              getcategotyDetails(row._id);
                              handleUpdateOpen(row);
                              console.log(imagePreview);
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
                  count={data.data.docs.length}
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
      {/* Add Category Modal */}
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <ModalContent sx={{ width: 400 }}>
          <h2 id="unstyled-modal-title" className="modal-title text-center">
            Add New Category
          </h2>
          <form className="mt-5" onSubmit={formik.handleSubmit}>
            <TextField
              style={{ width: "100%" }}
              className="formField"
              id="name"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
              label="Name"
              error={formik.touched.name && Boolean(formik.errors.name)}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="error">{formik.errors.name}</div>
            )}
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="imageCover"
              name="imageCover"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="imageCover">
              <Button
                variant="contained"
                color="primary"
                component="span"
                style={{ marginTop: "16px", display: "block" }}
              >
                Upload Image
              </Button>
            </label>
            {imagePreview && (
              <div style={{ marginTop: "16px" }}>
                <img src={imagePreview} alt="Preview" height="100" />
              </div>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "16px", display: "block" }}
            >
              Submit
            </Button>
          </form>
        </ModalContent>
      </Modal>

      {/* Update Category Modal */}
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={updateOpen}
        onClose={handleUpdateClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <ModalContent sx={{ width: 400 }}>
          <h2 id="unstyled-modal-title" className="modal-title text-center">
            Update Category
          </h2>
          <form className="mt-5" onSubmit={updateFormik.handleSubmit}>
            <TextField
              style={{ width: "100%" }}
              className="formField"
              id="name"
              name="name"
              onBlur={updateFormik.handleBlur}
              onChange={updateFormik.handleChange}
              value={updateFormik.values.name}
              label="Name"
              error={
                updateFormik.touched.name && Boolean(updateFormik.errors.name)
              }
            />
            {updateFormik.touched.name && updateFormik.errors.name && (
              <div className="error">{updateFormik.errors.name}</div>
            )}
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="updateImageCover"
              name="imageCover"
              type="file"
              onChange={handleUpdateFileChange}
            />
            <label htmlFor="updateImageCover">
              <Button
                variant="contained"
                color="primary"
                component="span"
                style={{ marginTop: "16px", display: "block" }}
              >
                Upload Image
              </Button>
            </label>
            {imagePreview && (
              <div style={{ marginTop: "16px" }}>
                <img src={imagePreview} alt="Preview" height="100" />
              </div>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "16px", display: "block" }}
            >
              Submit
            </Button>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Category"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the category "
            {selectedCategory?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => deleteMutation.mutate(selectedCategory._id)}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Modal Backdrop and Content styling
const Backdrop = forwardRef((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={clsx({ "base-Backdrop-open": open }, className)}
      ref={ref}
      {...other}
    />
  );
});

Backdrop.propTypes = {
  className: PropTypes.string.isRequired,
  open: PropTypes.bool,
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const ModalContent = styled("div")(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
    padding: 24px;
    color: ${theme.palette.mode === "dark" ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === "dark" ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `
);
