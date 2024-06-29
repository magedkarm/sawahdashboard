import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

export default function AddLandMark() {
  const [show, setShow] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [governorate, setGovernorate] = useState("");
  const [loading, setLoading] = useState(false);

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
    onSubmit: submitForm,
  });

  const handleCloseAdd = () => setShow(false);
  const handleShow = () => setShow(true);

  async function submitForm(values) {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("category", values.category);
      formData.append("description", values.description);
      formData.append(
        "location.coordinates[0]",
        values.location.coordinates[0]
      );
      formData.append(
        "location.coordinates[1]",
        values.location.coordinates[1]
      );
      formData.append("location.governorate", values.location.governorate);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/v1/landmarks",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      toast.success("Landmark added successfully!");
    } catch (error) {
      setLoading(false);
      if (error.response) {
        if (error.response.status === 400) {
          toast.error("Bad Request. Please check the form data.");
        } else if (error.response.status === 409) {
          toast.error("Conflict. The landmark already exists.");
        } else {
          toast.error(`Error: ${error.response.status}`);
        }
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  }

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
              addLandmarks
            </span>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Add Landmarks</h4>
            </div>
            <div className="card-body">
              <form className="formField" onSubmit={formik.handleSubmit}>
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
                          formik.touched.category &&
                          Boolean(formik.errors.category)
                        }
                      >
                        <MenuItem value="60e0e817830ad6b51767a37f">
                          Category 1
                        </MenuItem>
                        <MenuItem value="60e0e817830ad6b51767a380">
                          Category 2
                        </MenuItem>
                        <MenuItem value="60e0e817830ad6b51767a381">
                          Category 3
                        </MenuItem>
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
                      variant="primary"
                      onClick={handleShow}
                      className="btn w-100 p-3"
                    >
                      Pick Location
                    </Button>

                    <Modal show={show} onHide={handleCloseAdd}>
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
                  <div className="col-md-6">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
