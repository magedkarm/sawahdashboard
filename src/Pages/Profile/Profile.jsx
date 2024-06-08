import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { styled, css } from "@mui/system";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};
export default function Profile() {
  const [selectedValue, setSelectedValue] = useState("");
  const [show, setShow] = useState(false);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_API_KEY",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  //
  //
  //
  let formik = useFormik({
    initialValues: {
      name: "",
      category: "",
      description: "",
      // imageCover: "",
      // images: [],
      // location: {
      //   coordinates: [],
      //   governorate: "",
      // },
    },

    onSubmit: submitLogin,
  });
  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  async function submitLogin(values) {
    console.log(selectedValue);
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
          <div class="card">
            <div class="card-header">
              <h4 className="card-title ">Add Landmarks</h4>
            </div>
            <div class="card-body">
              <form className="formField" onSubmit={formik.handleSubmit}>
                <div className="row gy-4">
                  <div className="col-md-6">
                    <TextField
                      style={{ width: "100%" }}
                      className="formField"
                      id="outlined-required name"
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
                      <InputLabel id="demo-simple-select-label">
                        Select Category
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedValue}
                        label="Select Category"
                        onChange={handleChange}
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
                      className="formField"
                      id="outlined-required description"
                      name="description"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.description}
                      label="description"
                      multiline
                      rows={4}
                      error={
                        formik.touched.description &&
                        Boolean(formik.errors.description)
                      }
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <div classdescription="error">
                          {formik.errors.description}
                        </div>
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
                        <Modal.Title>Modal heading</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {" "}
                        <GoogleMap
                          mapContainerStyle={containerStyle}
                          center={center}
                          zoom={10}
                          onClick={handleMapClick}
                          options={{
                            mapTypeControl: true,
                            fullscreenControl: true,
                          }}
                        >
                          {selectedLocation && (
                            <Marker position={selectedLocation} />
                          )}
                        </GoogleMap>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                          Close
                        </Button>
                        <Button variant="primary" onClick={handleClose}>
                          Save Changes
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </div>
                  <div className="col-md-6">
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Select Category
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedValue}
                        label="Select Category"
                        onChange={handleChange}
                      >
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirty</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <button type="sumbit" className="btn btn-danger mt-4">
                  sad
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
