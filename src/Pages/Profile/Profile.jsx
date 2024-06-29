import React, { useState } from "react";
import { useFormik } from "formik";
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
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

export default function Profile() {
  const [show, setShow] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      category: "",
      description: "",
      location: {
        coordinates: [],
      },
    },
    onSubmit: submitForm,
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function submitForm(values) {
    console.log(values);
  }

  return (
    <>
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
                      style={{ width: "100%" }}
                      id="outlined-required-name"
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
                        label="Select Category"
                        onChange={formik.handleChange}
                      >
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-12">
                    <TextField
                      style={{ width: "100%" }}
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
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <div className="error">{formik.errors.description}</div>
                      )}
                  </div>
                  <div className="col-md-6">
                    <Button
                      variant="primary"
                      onClick={handleShow}
                      className="btn w-100 p-3"
                    >
                      Pick Location
                    </Button>

                    <Modal show={show} onHide={handleClose}>
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
                        <Button variant="secondary" onClick={handleClose}>
                          Close
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {
                            formik.setFieldValue(
                              "location.coordinates",
                              selectedLocation
                            );
                            handleClose();
                          }}
                        >
                          Save Changes
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </div>
                </div>
                <button type="submit" className="btn btn-danger mt-4">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
