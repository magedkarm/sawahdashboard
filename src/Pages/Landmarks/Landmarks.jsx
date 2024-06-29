import React, { useState, forwardRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Autocomplete,
} from "@mui/material";
import { styled, css } from "@mui/system";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Modal as BaseModal } from "@mui/base/Modal";
import Modal from "react-bootstrap/Modal";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";

// Fix for default icon issue with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = [30.0444, 31.2357]; // Coordinates for Cairo, Egypt

function LocationMarker({ setSelectedLocation }) {
  useMapEvents({
    click(e) {
      setSelectedLocation([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

// List of Egyptian Governorates
const egyptianGovernorates = [
  "Alexandria",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Matrouh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalyubia",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
  "Suez",
];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required."),
  category: Yup.string().required("Category is required."),
  description: Yup.string().required("Description is required."),
  location: Yup.object().shape({
    governorate: Yup.string().required("Governorate is required."),
    coordinates: Yup.array()
      .of(Yup.number().required("Coordinates are required."))
      .required("Coordinates are required."),
  }),
  images: Yup.array()
    .min(1, "At least one image is required.")
    .max(3, "You can upload up to 3 images only.")
    .required("Images are required."),
});

export default function Category() {
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUpdatePreview, setImageUpdatePreview] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [show, setShow] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [governorate, setGovernorate] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setImagePreview(null);
  };

  const handleUpdateOpen = (category) => {
    setSelectedCategory(category);
    setImageUpdatePreview(category.images[0]); // Assuming the first image is the cover image
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

  const getAllLandmarks = async () => {
    const response = await axios.get("api/v1/landmarks");
    return response.data;
  };

  const { data, isLoading, error } = useQuery("allLandmarks", getAllLandmarks);

  const getAllCategories = async () => {
    const response = await axios.get("api/v1/categories");
    return response.data;
  };

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery(
    "allCategories",
    getAllCategories
  );

  const deleteMutation = useMutation(
    (categoryId) =>
      axios.delete(`api/v1/landmarks/${categoryId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    {
      onSuccess: () => {
        toast.success("Category deleted successfully!", {
          position: "top-center",
        });
        queryClient.invalidateQueries("allLandmarks");
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
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newCategory.name);
      formData.append("category", newCategory.category);
      formData.append("description", newCategory.description);
      newCategory.images.forEach((image) => {
        formData.append("images", image);
      });
      formData.append(
        "location.coordinates[0]",
        newCategory.location.coordinates[0]
      );
      formData.append(
        "location.coordinates[1]",
        newCategory.location.coordinates[1]
      );
      formData.append("location.governorate", newCategory.location.governorate);

      return axios.post("api/v1/landmarks", formData, {
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
        queryClient.invalidateQueries("allLandmarks");
        setLoading(false);
        handleClose();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  // const updateMutation = useMutation(
  //   async ({ id, updatedCategory }) => {
  //     const formData = new FormData();
  //     formData.append("name", updatedCategory.name);
  //     formData.append("category", updatedCategory.category);
  //     formData.append("description", updatedCategory.description);
  //     updatedCategory.images.forEach((image) => {
  //       formData.append("images", image);
  //     });
  //     formData.append(
  //       "location.coordinates[0]",
  //       updatedCategory.location.coordinates[0]
  //     );
  //     formData.append(
  //       "location.coordinates[1]",
  //       updatedCategory.location.coordinates[1]
  //     );
  //     formData.append(
  //       "location.governorate",
  //       updatedCategory.location.governorate
  //     );

  //     const response = await axios.patch(`api/v1/landmarks/${id}`, formData, {
  //       headers: {
  //         Authorization: "Bearer " + localStorage.getItem("token"),
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     return response.data;
  //   },
  //   {
  //     onSuccess: (data) => {
  //       console.log(data);
  //       toast.success("Category updated successfully!", {
  //         position: "top-center",
  //       });
  //       queryClient.invalidateQueries("allLandmarks");
  //       handleUpdateClose();
  //       setImageUpdatePreview(null);
  //     },
  //     onError: (error) => {
  //       toast.error(`Error: ${error.response.data.message}`, {
  //         position: "top-center",
  //       });
  //     },
  //   }
  // );

  const formik = useFormik({
    initialValues: {
      name: "",
      category: "",
      description: "",
      images: [],
      location: {
        coordinates: [],
        governorate: "",
      },
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values); // Log form values to console
      mutation.mutate(values);
    },
  });
  const updateFormik = useFormik({
    initialValues: {
      name: selectedCategory?.name || "",
      category: selectedCategory?.category?._id || "",
      description: selectedCategory?.description || "",
      images: selectedCategory?.images || [],
    },
    enableReinitialize: true,
    // validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // First, update the details
        await updateDetailsMutation.mutateAsync({
          id: selectedCategory._id,
          updatedCategory: values,
        });

        // Check if new images are uploaded
        const newImages = updateFormik.values.images.filter(
          (image) => typeof image !== "string"
        );
        if (newImages.length > 0) {
          await updateImagesMutation.mutateAsync({
            id: selectedCategory._id,
            images: newImages,
          });
        }

        toast.success("Landmark updated successfully!", {
          position: "top-center",
        });

        queryClient.invalidateQueries("allLandmarks");
        setImageUpdatePreview(null);
        handleUpdateClose();
      } catch (error) {
        console.error("Error during form submission:", error);
        toast.error(`Error: ${error.message}`, {
          position: "top-center",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const updateDetailsMutation = useMutation(
    async ({ id, updatedCategory }) => {
      const dataToSend = {
        name: updatedCategory.name,
        category: updatedCategory.category,
        description: updatedCategory.description,
      };

      // console.log("Sending details to the server:", dataToSend);

      return axios.patch(`api/v1/landmarks/${id}`, dataToSend, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      });
    },
    {
      onSuccess: () => {
        console.log("Details mutation onSuccess");
        queryClient.invalidateQueries("allLandmarks");
      },
      onError: (error) => {
        console.error("Details mutation onError:", error);
      },
    }
  );

  const updateImagesMutation = useMutation(
    async ({ id, images }) => {
      console.log(images);
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("images", image);
        formData.append("imagesIndex", index);
      });

      console.log("Sending images to the server:", formData);

      return axios.patch(`api/v1/landmarks/${id}/images`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        console.log("Images mutation onSuccess");
        queryClient.invalidateQueries("allLandmarks");
      },
      onError: (error) => {
        console.error("Images mutation onError:", error);
      },
    }
  );

  const handleUpdateFileChange = (event) => {
    const files = Array.from(event.currentTarget.files).slice(0, 3);
    setImages(files); // Update the local state
    updateFormik.setFieldValue("images", files); // Update Formik values
    setImageUpdatePreview(URL.createObjectURL(files[0])); // Set the image preview
  };

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    formik.setFieldValue("images", files);
  };

  const handleGovernorateChange = (_, value) => {
    formik.setFieldValue("location.governorate", value);
    setGovernorate(value);
  };

  const handleLocationSave = () => {
    if (selectedLocation) {
      formik.setFieldValue("location.coordinates", selectedLocation);
      handleCloseAdd();
    }
  };

  const handleCloseAdd = () => setShow(false);
  const handleShow = () => setShow(true);

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
              Landmarks
            </span>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">All Landmarks</h4>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Add Landmark <i className="ps-3 fa-solid fa-plus"></i>
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
                        <TableCell component="th" scope="row">
                          {ind + 1}
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">
                          {row?.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              className=" p-1  rounded-4"
                              alt={row.name}
                              height="100"
                            />
                          ))}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                              handleUpdateOpen(row);
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
      {/* Add Landmark Modal */}
      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <ModalContent sx={{ width: 800 }}>
          <h2 id="unstyled-modal-title" className="modal-title text-center">
            Add New Landmark
          </h2>
          <form className="mt-5" onSubmit={formik.handleSubmit}>
            <div className="row gy-4">
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-name"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  label="Name"
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </div>
              <div className="col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="select-category-label">
                    Select Category
                  </InputLabel>
                  <Select
                    labelId="select-category-label"
                    id="select-category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    label="Select Category"
                    error={
                      formik.touched.category && Boolean(formik.errors.category)
                    }
                  >
                    {categoryData?.data.docs.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <div className="error">{formik.errors.category}</div>
                  )}
                </FormControl>
              </div>
              <div className="col-12">
                <TextField
                  fullWidth
                  id="outlined-required-description"
                  name="description"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.description}
                  label="Description"
                  multiline
                  rows={4}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </div>
              <div className="col-md-6">
                <Autocomplete
                  options={egyptianGovernorates}
                  value={governorate}
                  onChange={handleGovernorateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Governorate"
                      variant="outlined"
                      error={
                        formik.touched.location?.governorate &&
                        Boolean(formik.errors.location?.governorate)
                      }
                      helperText={
                        formik.touched.location?.governorate &&
                        formik.errors.location?.governorate
                      }
                    />
                  )}
                />
              </div>
              <div className="col-md-6">
                <Button
                  variant="contained"
                  onClick={handleShow}
                  color="primary"
                  className="btn w-100 p-3"
                >
                  Pick Location
                </Button>
                <Modal
                  show={show}
                  onHide={handleCloseAdd}
                  style={{ zIndex: 5000 }}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Pick Location</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <MapContainer
                      center={center}
                      zoom={13}
                      style={containerStyle}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker
                        setSelectedLocation={setSelectedLocation}
                      />
                      {selectedLocation && (
                        <Marker position={selectedLocation}></Marker>
                      )}
                    </MapContainer>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAdd}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleLocationSave}>
                      Save Changes
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
              <div className="col-md-12">
                <div className="form-group">
                  <label htmlFor="images" className="form-label">
                    Upload Images (up to 3):
                  </label>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="form-control"
                  />
                  {formik.touched.images && formik.errors.images && (
                    <div
                      className="error"
                      style={{ color: "red", marginTop: "10px" }}
                    >
                      {formik.errors.images}
                    </div>
                  )}
                  <div
                    className="uploaded-images"
                    style={{ marginTop: "10px" }}
                  >
                    {images.map((image, index) => (
                      <div
                        key={index}
                        style={{
                          display: "inline-block",
                          marginRight: "10px",
                        }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Landmark ${index + 1}`}
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "16px", display: "block" }}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </ModalContent>
      </StyledModal>

      {/* Update Category Modal */}
      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={updateOpen}
        onClose={handleUpdateClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <ModalContent sx={{ width: 800 }}>
          <h2 id="unstyled-modal-title" className="modal-title text-center">
            Update Landmark
          </h2>
          <form className="mt-5" onSubmit={updateFormik.handleSubmit}>
            <div className="row gy-4">
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-name"
                  name="name"
                  onBlur={updateFormik.handleBlur}
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.name}
                  label="Name"
                  error={
                    updateFormik.touched.name &&
                    Boolean(updateFormik.errors.name)
                  }
                  helperText={
                    updateFormik.touched.name && updateFormik.errors.name
                  }
                />
              </div>
              <div className="col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="select-category-label">
                    Select Category
                  </InputLabel>
                  <Select
                    labelId="select-category-label"
                    id="select-category"
                    name="category"
                    value={updateFormik.values.category}
                    onChange={updateFormik.handleChange}
                    label="Select Category"
                    error={
                      updateFormik.touched.category &&
                      Boolean(updateFormik.errors.category)
                    }
                  >
                    {categoryData?.data.docs.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateFormik.touched.category &&
                    updateFormik.errors.category && (
                      <div className="error">
                        {updateFormik.errors.category}
                      </div>
                    )}
                </FormControl>
              </div>
              <div className="col-12">
                <TextField
                  fullWidth
                  id="outlined-required-description"
                  name="description"
                  onBlur={updateFormik.handleBlur}
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.description}
                  label="Description"
                  multiline
                  rows={4}
                  error={
                    updateFormik.touched.description &&
                    Boolean(updateFormik.errors.description)
                  }
                  helperText={
                    updateFormik.touched.description &&
                    updateFormik.errors.description
                  }
                />
              </div>
              <div className="col-md-12">
                <div className="form-group">
                  <label htmlFor="images" className="form-label">
                    Upload Images (up to 3):
                  </label>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleUpdateFileChange}
                    className="form-control"
                  />
                  {updateFormik.touched.images &&
                    updateFormik.errors.images && (
                      <div
                        className="error"
                        style={{ color: "red", marginTop: "10px" }}
                      >
                        {updateFormik.errors.images}
                      </div>
                    )}
                  <div
                    className="uploaded-images"
                    style={{ marginTop: "10px" }}
                  >
                    {images.map((image, index) => (
                      <div
                        key={index}
                        style={{ display: "inline-block", marginRight: "10px" }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Landmark ${index + 1}`}
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "16px", display: "block" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </ModalContent>
      </StyledModal>

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

const StyledModal = styled(BaseModal)`
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
