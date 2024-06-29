import React from "react";
import { Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import { Modal, StyledBackdrop, ModalContent } from "./StyledComponents";

const FormModal = ({
  open,
  handleClose,
  handleSubmit,
  imagePreview,
  handleFileChange,
  title,
  initialValues,
}) => {
  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={handleClose}
      slots={{ backdrop: StyledBackdrop }}
    >
      <ModalContent sx={{ width: 400 }}>
        <h2 id="unstyled-modal-title" className="modal-title text-center">
          {title}
        </h2>
        <form className="mt-5" onSubmit={formik.handleSubmit}>
          {Object.keys(initialValues).map((key) =>
            key !== "imageCover" ? (
              <TextField
                key={key}
                style={{ width: "100%", marginBottom: "16px" }}
                className="formField"
                id={key}
                name={key}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values[key]}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                error={formik.touched[key] && Boolean(formik.errors[key])}
              />
            ) : (
              <div key={key}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id={key}
                  name={key}
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor={key}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    style={{ display: "block" }}
                  >
                    Upload Image
                  </Button>
                </label>
                {imagePreview && (
                  <div style={{ marginTop: "16px" }}>
                    <img src={imagePreview} alt="Preview" height="100" />
                  </div>
                )}
              </div>
            )
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
  );
};

export default FormModal;
