import React, { useState, useEffect } from "react";
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
import { Modal as BaseModal } from "@mui/base/Modal";
import Modal from "react-bootstrap/Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
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
  maxGroupSize: Yup.number().required("Max group size is required."),
  duration: Yup.number().required("Duration is required."),
  price: Yup.number().required("Price is required."),
  startDays: Yup.array().min(1, "At least one start day is required."),
  guide: Yup.string().required("Guide is required."),
});

export default function Tours() {
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
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

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

  // APIs
  const getAllTours = async () => {
    const response = await axios.get("api/v1/tours");
    return response.data;
  };

  const { data, isLoading, error } = useQuery("allTours", getAllTours);

  const getAllTourCategories = async () => {
    const response = await axios.get("api/v1/tourCategories");
    return response.data;
  };

  const { data: tourCategoryData } = useQuery(
    "allTourCategories",
    getAllTourCategories
  );
  const getAllGuides = async () => {
    const response = await axios.get("/api/v1/users", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    return response.data.data.docs.filter((user) => user.role === "guide");
  };

  const { data: guideData } = useQuery("allGuides", getAllGuides);
  //   end APis

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
        queryClient.invalidateQueries("allTours");
        handleDeleteClose();
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
      category: selectedCategory?.category?._id || "",
      description: selectedCategory?.description || "",
      price: selectedCategory?.price || 0,
      maxGroupSize: selectedCategory?.maxGroupSize || 0,
      startDays: selectedCategory?.startDays || [],
      guide: selectedCategory?.guide?._id || "",
      images: selectedCategory?.images || [],
      location: selectedCategory?.location || {
        coordinates: [],
        governorate: "",
      },
    },
    enableReinitialize: true,
    // validationSchema: validationSchema,
    onSubmit: async (values) => {
      //   console.log(values);
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

        toast.success("Tour updated successfully!", {
          position: "top-center",
        });

        queryClient.invalidateQueries("allTours");
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

  const addFormik = useFormik({
    initialValues: {
      name: "",
      category: "",
      description: "",
      duration: 0,
      price: 0,
      maxGroupSize: 0,
      startDays: [],
      guide: "",
      images: [],
      location: { coordinates: [], governorate: "" },
    },
    // validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log(values);
      setIsSubmitting(true);
      try {
        await addTourMutation.mutateAsync(values);

        toast.success("Tour added successfully!", {
          position: "top-center",
        });

        queryClient.invalidateQueries("allTours");
        addFormik.resetForm();
        handleClose();
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
      console.log(updatedCategory);
      const dataToSend = {
        name: updatedCategory.name,
        category: updatedCategory.category,
        description: updatedCategory.description,
        price: updatedCategory.price,
        maxGroupSize: updatedCategory.maxGroupSize,
        startDays: updatedCategory.startDays,
        guide: updatedCategory.guide,
        location: updatedCategory.location,
      };

      return axios.patch(`api/v1/tours/${id}`, dataToSend, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      });
    },
    {
      onSuccess: (response) => {
        console.log("Response from updateDetailsMutation:", response.data);
        queryClient.invalidateQueries("allTours");
      },
      onError: (error) => {
        console.error("Details mutation onError:", error);
      },
    }
  );

  const updateImagesMutation = useMutation(
    async ({ id, images }) => {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("images", image);
        formData.append("imagesIndex", index);
      });

      return axios.patch(`api/v1/tours/${id}/images`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("allTours");
      },
      onError: (error) => {
        console.error("Images mutation onError:", error);
      },
    }
  );

  const addTourMutation = useMutation(
    async (newTour) => {
      console.log(newTour);
      const formData = new FormData();
      formData.append("name", newTour.name);
      formData.append("category", newTour.category);
      formData.append("description", newTour.description);
      formData.append("price", newTour.price);
      formData.append("maxGroupSize", newTour.maxGroupSize);
      formData.append("guide", newTour.guide);
      formData.append("duration", newTour.duration);
      formData.append("startDays", newTour.startDays);
      formData.append("location[address]", newTour.location.address);
      formData.append(
        "location[coordinates][0]",
        newTour.location.coordinates[0]
      );
      formData.append(
        "location[coordinates][1]",
        newTour.location.coordinates[1]
      );
      formData.append("location[type]", "Point");
      newTour.images.forEach((image, index) => {
        formData.append("images", image);
        formData.append("imagesIndex", index);
      });

      return axios.post(`api/v1/tours`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("allTours");
      },
      onError: (error) => {
        console.error("Add tour mutation onError:", error);
      },
    }
  );

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

  const handleCloseAdd = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedRows = [...visibleRows].sort((a, b) => {
    const aValue = sortConfig.key.includes(".")
      ? sortConfig.key.split(".").reduce((o, i) => o[i], a)
      : a[sortConfig.key];
    const bValue = sortConfig.key.includes(".")
      ? sortConfig.key.split(".").reduce((o, i) => o[i], b)
      : b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    addFormik.setFieldValue("images", files);
  };

  const handleGovernorateChange = (_, value) => {
    addFormik.setFieldValue("location.governorate", value);
    setGovernorate(value);
  };

  const handleUpdateGovernorateChange = (_, value) => {
    updateFormik.setFieldValue("location.governorate", value);
    setGovernorate(value);
  };

  const handleLocationSave = () => {
    if (selectedLocation) {
      addFormik.setFieldValue("location.coordinates", selectedLocation);
      handleCloseAdd();
    }
  };

  const handleUpdateLocationSave = () => {
    if (selectedLocation) {
      updateFormik.setFieldValue("location.coordinates", selectedLocation);
      handleCloseAdd();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="Tours">
        <div className="pageTitles">
          <h3>
            Panel /{" "}
            <span
              style={{ fontSize: "20px", fontWeight: "400", color: "#87898b" }}
            >
              Tours
            </span>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">All Tours</h4>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Add Tour <i className="ps-3 fa-solid fa-plus"></i>
              </Button>
            </div>
            <div className="card-body">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">Index</TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleSort("name")}
                        style={{ cursor: "pointer" }}
                      >
                        Name{" "}
                        {sortConfig.key === "name" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell align="center">Image</TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleSort("price")}
                        style={{ cursor: "pointer" }}
                      >
                        Price{" "}
                        {sortConfig.key === "price" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleSort("maxGroupSize")}
                        style={{ cursor: "pointer" }}
                      >
                        Max Group Size{" "}
                        {sortConfig.key === "maxGroupSize" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleSort("guide.name")}
                        style={{ cursor: "pointer" }}
                      >
                        Guide Name{" "}
                        {sortConfig.key === "guide.name" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleSort("bookings")}
                        style={{ cursor: "pointer" }}
                      >
                        Bookings{" "}
                        {sortConfig.key === "bookings" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleSort("createdAt")}
                        style={{ cursor: "pointer" }}
                      >
                        Created At{" "}
                        {sortConfig.key === "createdAt" &&
                          (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedRows.map((row, ind) => (
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
                          {row?.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              className="p-1 rounded-4"
                              alt={row.name}
                              height="100"
                            />
                          ))}
                        </TableCell>
                        <TableCell align="center">{row.price}</TableCell>
                        <TableCell align="center">{row.maxGroupSize}</TableCell>
                        <TableCell align="center">{row.guide?.name}</TableCell>
                        <TableCell align="center">{row.bookings}</TableCell>
                        <TableCell align="center">
                          {new Date(row.createdAt).toLocaleDateString()}
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
                        <TableCell colSpan={9} />
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

      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={updateOpen}
        onClose={handleUpdateClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <ModalContent sx={{ width: 800 }}>
          <h2 id="unstyled-modal-title" className="modal-title text-center">
            Update Tour
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
                    {tourCategoryData?.data.docs.map((category) => (
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
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-price"
                  name="price"
                  onBlur={updateFormik.handleBlur}
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.price}
                  label="Price"
                  error={
                    updateFormik.touched.price &&
                    Boolean(updateFormik.errors.price)
                  }
                  helperText={
                    updateFormik.touched.price && updateFormik.errors.price
                  }
                />
              </div>
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-maxGroupSize"
                  name="maxGroupSize"
                  onBlur={updateFormik.handleBlur}
                  onChange={updateFormik.handleChange}
                  value={updateFormik.values.maxGroupSize}
                  label="Max Group Size"
                  error={
                    updateFormik.touched.maxGroupSize &&
                    Boolean(updateFormik.errors.maxGroupSize)
                  }
                  helperText={
                    updateFormik.touched.maxGroupSize &&
                    updateFormik.errors.maxGroupSize
                  }
                />
              </div>
              <div className="col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="select-guide-label">Select Guide</InputLabel>
                  <Select
                    labelId="select-guide-label"
                    id="select-guide"
                    name="guide"
                    value={updateFormik.values.guide}
                    onChange={updateFormik.handleChange}
                    label="Select Guide"
                    error={
                      updateFormik.touched.guide &&
                      Boolean(updateFormik.errors.guide)
                    }
                  >
                    {guideData?.map((guide) => (
                      <MenuItem key={guide._id} value={guide._id}>
                        {guide.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateFormik.touched.guide && updateFormik.errors.guide && (
                    <div className="error">{updateFormik.errors.guide}</div>
                  )}
                </FormControl>
              </div>
              <div className="col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="select-startDays-label">
                    Select Start Days
                  </InputLabel>
                  <Select
                    labelId="select-startDays-label"
                    id="select-startDays"
                    name="startDays"
                    value={updateFormik.values.startDays}
                    onChange={updateFormik.handleChange}
                    multiple
                    label="Select Start Days"
                    error={
                      updateFormik.touched.startDays &&
                      Boolean(updateFormik.errors.startDays)
                    }
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                  {updateFormik.touched.startDays &&
                    updateFormik.errors.startDays && (
                      <div className="error">
                        {updateFormik.errors.startDays}
                      </div>
                    )}
                </FormControl>
              </div>
              <div className="col-md-6">
                <Autocomplete
                  options={egyptianGovernorates}
                  value={updateFormik.values.location.governorate}
                  onChange={handleUpdateGovernorateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Governorate"
                      variant="outlined"
                      error={
                        updateFormik.touched.location?.governorate &&
                        Boolean(updateFormik.errors.location?.governorate)
                      }
                      helperText={
                        updateFormik.touched.location?.governorate &&
                        updateFormik.errors.location?.governorate
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
                    <Button
                      variant="primary"
                      onClick={handleUpdateLocationSave}
                    >
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
                    onChange={(event) => {
                      const files = Array.from(event.currentTarget.files).slice(
                        0,
                        3
                      );
                      setImages(files); // Update the local state
                      updateFormik.setFieldValue("images", files); // Update Formik values
                      setImageUpdatePreview(URL.createObjectURL(files[0])); // Set the image preview
                    }}
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
                        style={{
                          display: "inline-block",
                          marginRight: "10px",
                        }}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Tour ${index + 1}`}
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

      <StyledModal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <ModalContent sx={{ width: 800 }}>
          <h2 id="unstyled-modal-title" className="modal-title text-center">
            Add New Tour
          </h2>
          <form className="mt-5" onSubmit={addFormik.handleSubmit}>
            <div className="row gy-4">
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-name"
                  name="name"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.name}
                  label="Name"
                  error={
                    addFormik.touched.name && Boolean(addFormik.errors.name)
                  }
                  helperText={addFormik.touched.name && addFormik.errors.name}
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
                    value={addFormik.values.category}
                    onChange={addFormik.handleChange}
                    label="Select Category"
                    error={
                      addFormik.touched.category &&
                      Boolean(addFormik.errors.category)
                    }
                  >
                    {tourCategoryData?.data.docs.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {addFormik.touched.category && addFormik.errors.category && (
                    <div className="error">{addFormik.errors.category}</div>
                  )}
                </FormControl>
              </div>
              <div className="col-12">
                <TextField
                  fullWidth
                  id="outlined-required-description"
                  name="description"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.description}
                  label="Description"
                  multiline
                  rows={4}
                  error={
                    addFormik.touched.description &&
                    Boolean(addFormik.errors.description)
                  }
                  helperText={
                    addFormik.touched.description &&
                    addFormik.errors.description
                  }
                />
              </div>
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-price"
                  name="price"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.price}
                  label="Price"
                  error={
                    addFormik.touched.price && Boolean(addFormik.errors.price)
                  }
                  helperText={addFormik.touched.price && addFormik.errors.price}
                />
              </div>
              <div className="col-md-6">
                <TextField
                  fullWidth
                  id="outlined-required-duration"
                  name="duration"
                  onBlur={addFormik.handleBlur}
                  onChange={addFormik.handleChange}
                  value={addFormik.values.duration}
                  label="Duration"
                  error={
                    addFormik.touched.duration &&
                    Boolean(addFormik.errors.duration)
                  }
                  helperText={
                    addFormik.touched.duration && addFormik.errors.duration
                  }
                />
              </div>
              <div className="col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="select-guide-label">Select Guide</InputLabel>
                  <Select
                    labelId="select-guide-label"
                    id="select-guide"
                    name="guide"
                    value={addFormik.values.guide}
                    onChange={addFormik.handleChange}
                    label="Select Guide"
                    error={
                      addFormik.touched.guide && Boolean(addFormik.errors.guide)
                    }
                  >
                    {guideData?.map((guide) => (
                      <MenuItem key={guide._id} value={guide._id}>
                        {guide.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {addFormik.touched.guide && addFormik.errors.guide && (
                    <div className="error">{addFormik.errors.guide}</div>
                  )}
                </FormControl>
              </div>
              <div className="col-md-6">
                <FormControl fullWidth>
                  <InputLabel id="select-startDays-label">
                    Select Start Days
                  </InputLabel>
                  <Select
                    labelId="select-startDays-label"
                    id="select-startDays"
                    name="startDays"
                    value={addFormik.values.startDays}
                    onChange={addFormik.handleChange}
                    multiple
                    label="Select Start Days"
                    error={
                      addFormik.touched.startDays &&
                      Boolean(addFormik.errors.startDays)
                    }
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                  {addFormik.touched.startDays &&
                    addFormik.errors.startDays && (
                      <div className="error">{addFormik.errors.startDays}</div>
                    )}
                </FormControl>
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
                        addFormik.touched.location?.governorate &&
                        Boolean(addFormik.errors.location?.governorate)
                      }
                      helperText={
                        addFormik.touched.location?.governorate &&
                        addFormik.errors.location?.governorate
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
                  {addFormik.touched.images && addFormik.errors.images && (
                    <div
                      className="error"
                      style={{ color: "red", marginTop: "10px" }}
                    >
                      {addFormik.errors.images}
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
                          alt={`Tour ${index + 1}`}
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

      <Dialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Tour"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the tour "{selectedCategory?.name}"?
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

const StyledModal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled("div")`
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
    background-color: ${theme.palette.mode === "dark" ? "#303740" : "#fff"};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === "dark" ? "#434D5B" : "#DAE2ED"};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
    padding: 24px;
    color: ${theme.palette.mode === "dark" ? "#F3F6F9" : "#1C2025"};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === "dark" ? "#DAE2ED" : "#6B7A90"};
      margin-bottom: 4px;
    }
  `
);
