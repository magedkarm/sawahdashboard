// import React, { forwardRef, useState } from "react";
// import axios from "axios";
// import { useQuery, useMutation, useQueryClient } from "react-query";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   TextField,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   TablePagination,
// } from "@mui/material";
// import { styled, css } from "@mui/system";
// import PropTypes from "prop-types";
// import clsx from "clsx";
// import { Modal as BaseModal } from "@mui/base/Modal";
// import { useFormik } from "formik";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Fix for default icon issue with leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const center = [30.0444, 31.2357]; // Coordinates for Cairo, Egypt

// function LocationMarker({ setSelectedLocation }) {
//   useMapEvents({
//     click(e) {
//       setSelectedLocation([e.latlng.lat, e.latlng.lng]);
//     },
//   });

//   return null;
// }

// // List of Egyptian Governorates
// const egyptianGovernorates = [
//   "Alexandria",
//   "Aswan",
//   "Asyut",
//   "Beheira",
//   "Beni Suef",
//   "Cairo",
//   "Dakahlia",
//   "Damietta",
//   "Faiyum",
//   "Gharbia",
//   "Giza",
//   "Ismailia",
//   "Kafr El Sheikh",
//   "Luxor",
//   "Matrouh",
//   "Minya",
//   "Monufia",
//   "New Valley",
//   "North Sinai",
//   "Port Said",
//   "Qalyubia",
//   "Qena",
//   "Red Sea",
//   "Sharqia",
//   "Sohag",
//   "South Sinai",
//   "Suez",
// ];

// const validationSchema = Yup.object({
//   name: Yup.string().required("Name is required."),
//   category: Yup.string().required("Category is required."),
//   description: Yup.string().required("Description is required."),
//   location: Yup.object().shape({
//     governorate: Yup.string().required("Governorate is required."),
//     coordinates: Yup.array()
//       .of(Yup.number().required("Coordinates are required."))
//       .required("Coordinates are required."),
//   }),
//   images: Yup.array()
//     .min(1, "At least one image is required.")
//     .max(3, "You can upload up to 3 images only.")
//     .required("Images are required."),
// });
// export default function Category() {
//   const [open, setOpen] = useState(false);
//   const [updateOpen, setUpdateOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageUpdatePreview, setImageUpdatePreview] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const queryClient = useQueryClient();
//   const [show, setShowAD] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [images, setImages] = useState([]);
//   const [governorate, setGovernorate] = useState("");
//   const [loading, setLoading] = useState(false);

//   const formik = useFormik({
//     initialValues: {
//       name: "",
//       category: "",
//       description: "",
//       images: [],
//       location: {
//         coordinates: [],
//         governorate: "",
//       },
//     },
//     validationSchema,
//     onSubmit: submitForm,
//   });

//   const handleCloseAdd = () => setShow(false);
//   const handleShow = () => setShow(true);

//   async function submitForm(values) {
//     setLoading(true);
//     try {
//       const formData = new FormData();

//       formData.append("name", values.name);
//       formData.append("category", values.category);
//       formData.append("description", values.description);
//       formData.append(
//         "location.coordinates[0]",
//         values.location.coordinates[0]
//       );
//       formData.append(
//         "location.coordinates[1]",
//         values.location.coordinates[1]
//       );
//       formData.append("location.governorate", values.location.governorate);

//       images.forEach((image) => {
//         formData.append("images", image);
//       });

//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         "http://localhost:8000/api/v1/landmarks",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setLoading(false);
//       toast.success("Landmark added successfully!");
//     } catch (error) {
//       setLoading(false);
//       if (error.response) {
//         if (error.response.status === 400) {
//           toast.error("Bad Request. Please check the form data.");
//         } else if (error.response.status === 409) {
//           toast.error("Conflict. The landmark already exists.");
//         } else {
//           toast.error(`Error: ${error.response.status}`);
//         }
//       } else if (error.request) {
//         toast.error("No response from server. Please try again later.");
//       } else {
//         toast.error(`Error: ${error.message}`);
//       }
//     }
//   }

//   const handleImagesChange = (e) => {
//     const files = Array.from(e.target.files).slice(0, 3);
//     setImages(files);
//     formik.setFieldValue("images", files);
//   };

//   const handleGovernorateChange = (_, value) => {
//     formik.setFieldValue("location.governorate", value);
//     setGovernorate(value);
//   };

//   const handleLocationSave = () => {
//     if (selectedLocation) {
//       formik.setFieldValue("location.coordinates", selectedLocation);
//       handleCloseAdd();
//     }
//   };
//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setOpen(false);
//     setImagePreview(null);
//   };

//   const handleUpdateOpen = (category) => {
//     setSelectedCategory(category);
//     setUpdateOpen(true);
//   };
//   const handleUpdateClose = () => {
//     setUpdateOpen(false);
//     setSelectedCategory(null);
//   };

//   const handleDeleteOpen = (category) => {
//     setSelectedCategory(category);
//     setDeleteOpen(true);
//   };
//   const handleDeleteClose = () => {
//     setDeleteOpen(false);
//     setSelectedCategory(null);
//   };

//   const getAllCategories = async () => {
//     const response = await axios.get("api/v1/landmarks");
//     return response.data;
//   };

//   const { data, isLoading, error } = useQuery("allLandmarks", getAllCategories);

//   const deleteMutation = useMutation(
//     (categoryId) =>
//       axios.delete(`api/v1/landmarks/${categoryId}`, {
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("token"),
//         },
//       }),
//     {
//       onSuccess: () => {
//         toast.success("Category deleted successfully!", {
//           position: "top-center",
//         });
//         queryClient.invalidateQueries("allCategories");
//         handleDeleteClose();
//       },
//       onError: (error) => {
//         toast.error(`Error: ${error.response.data.message}`, {
//           position: "top-center",
//         });
//       },
//     }
//   );

//   const mutation = useMutation(
//     (newCategory) => {
//       const formData = new FormData();
//       formData.append("name", newCategory.name);
//       formData.append("imageCover", newCategory.imageCover);

//       return axios.post("api/v1/landmarks", formData, {
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("token"),
//           "Content-Type": "multipart/form-data",
//         },
//       });
//     },
//     {
//       onSuccess: () => {
//         toast.success("Category added successfully!", {
//           position: "top-center",
//         });
//         queryClient.invalidateQueries("allCategories");
//         handleClose();
//       },
//       onError: (error) => {
//         toast.error(`Error: ${error.response.data.message}`, {
//           position: "top-center",
//         });
//       },
//     }
//   );

//   const updateMutation = useMutation(
//     ({ id, updatedCategory }) => {
//       const formData = new FormData();
//       formData.append("name", updatedCategory.name);
//       formData.append("imageCover", updatedCategory.imageCover);

//       return axios.patch(`api/v1/landmarks/${id}`, formData, {
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("token"),
//           "Content-Type": "multipart/form-data",
//         },
//       });
//     },
//     {
//       onSuccess: () => {
//         toast.success("Category updated successfully!", {
//           position: "top-center",
//         });
//         queryClient.invalidateQueries("allCategories");
//         handleUpdateClose();
//         setImageUpdatePreview(null);
//       },
//       onError: (error) => {
//         toast.error(`Error: ${error.response.data.message}`, {
//           position: "top-center",
//         });
//       },
//     }
//   );
//   const updateFormik = useFormik({
//     initialValues: {
//       name: selectedCategory?.name || "",
//       imageCover: imageUpdatePreview,
//     },
//     enableReinitialize: true,
//     onSubmit: (values) => {
//       updateMutation.mutate({
//         id: selectedCategory._id,
//         updatedCategory: values,
//       });
//     },
//   });

//   const formik = useFormik({
//     initialValues: {
//       name: "",
//       imageCover: null,
//     },
//     onSubmit: (values) => {
//       mutation.mutate(values);
//     },
//   });

//   const handleFileChange = (event) => {
//     const file = event.currentTarget.files[0];
//     formik.setFieldValue("imageCover", file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const handleUpdateFileChange = (event) => {
//     const file = event.currentTarget.files[0];
//     updateFormik.setFieldValue("imageCover", file);
//     setImagePreview(URL.createObjectURL(file));
//   };
//   async function getcategotyDetails(id) {
//     try {
//       const { data: categoryDetails } = await axios.get(
//         `api/v1/landmarks/${id}`,
//         {}
//       );
//       setImageUpdatePreview(categoryDetails?.data.doc.imageCover);
//       setImagePreview(categoryDetails?.data.doc.imageCover);
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const emptyRows =
//     page > 0
//       ? Math.max(0, (1 + page) * rowsPerPage - data.data.docs.length)
//       : 0;

//   const visibleRows = data
//     ? data.data.docs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//     : [];

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>An error occurred: {error.message}</div>;

//   return (
//     <>
//       <ToastContainer />
//       <div className="landmark">
//         <div className="pageTitles">
//           <h3>
//             Panel /{" "}
//             <span
//               style={{ fontSize: "20px", fontWeight: "400", color: "#87898b" }}
//             >
//               Category
//             </span>
//           </h3>
//         </div>
//       </div>
//       <div className="row">
//         <div className="col-12">
//           <div className="card">
//             <div className="card-header">
//               <h4 className="card-title">All Categories</h4>
//               <Button variant="contained" color="primary" onClick={handleOpen}>
//                 Add Category <i className="ps-3 fa-solid fa-plus"></i>
//               </Button>
//             </div>
//             <div className="card-body">
//               <TableContainer component={Paper}>
//                 <Table sx={{ minWidth: 650 }} aria-label="simple table">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell align="left">Index</TableCell>
//                       <TableCell align="center">Name</TableCell>
//                       <TableCell align="center">Image</TableCell>
//                       <TableCell align="center">Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {visibleRows.map((row, ind) => (
//                       <TableRow
//                         key={row._id}
//                         sx={{
//                           "&:last-child td, &:last-child th": { border: 0 },
//                         }}
//                       >
//                         <TableCell component="th" scope="row">
//                           {ind + 1}
//                         </TableCell>
//                         <TableCell align="center">{row.name}</TableCell>
//                         <TableCell align="center">
//                           {row?.images.map((img) => {
//                             return (
//                               <img
//                                 src={img}
//                                 className=" p-1  rounded-4"
//                                 alt={row.name}
//                                 height="100"
//                               />
//                             );
//                           })}
//                         </TableCell>
//                         <TableCell align="center">
//                           <Button
//                             variant="contained"
//                             color="secondary"
//                             onClick={() => {
//                               getcategotyDetails(row._id);
//                               handleUpdateOpen(row);
//                               console.log(imagePreview);
//                             }}
//                             style={{ marginRight: "8px" }}
//                           >
//                             Update
//                           </Button>
//                           <Button
//                             variant="contained"
//                             color="error"
//                             onClick={() => handleDeleteOpen(row)}
//                           >
//                             Delete
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                     {emptyRows > 0 && (
//                       <TableRow style={{ height: 53 * emptyRows }}>
//                         <TableCell colSpan={6} />
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25]}
//                   component="div"
//                   count={data.data.docs.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={handleChangePage}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                 />
//               </TableContainer>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Add Category Modal */}
//       <Modal
//         aria-labelledby="unstyled-modal-title"
//         aria-describedby="unstyled-modal-description"
//         open={open}
//         onClose={handleClose}
//         slots={{ backdrop: StyledBackdrop }}
//       >
//         <ModalContent sx={{ width: 400 }}>
//           <h2 id="unstyled-modal-title" className="modal-title text-center">
//             Add New Category
//           </h2>
//           <form className="formField" onSubmit={formik.handleSubmit}>
//             <div className="row gy-4">
//               <div className="col-md-6">
//                 <TextField
//                   fullWidth
//                   id="outlined-required-name"
//                   name="name"
//                   onBlur={formik.handleBlur}
//                   onChange={formik.handleChange}
//                   value={formik.values.name}
//                   label="Name"
//                   error={formik.touched.name && Boolean(formik.errors.name)}
//                   helperText={formik.touched.name && formik.errors.name}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <FormControl fullWidth>
//                   <InputLabel id="select-category-label">
//                     Select Category
//                   </InputLabel>
//                   <Select
//                     labelId="select-category-label"
//                     id="select-category"
//                     name="category"
//                     value={formik.values.category}
//                     onChange={formik.handleChange}
//                     label="Select Category"
//                     error={
//                       formik.touched.category && Boolean(formik.errors.category)
//                     }
//                   >
//                     <MenuItem value="60e0e817830ad6b51767a37f">
//                       Category 1
//                     </MenuItem>
//                     <MenuItem value="60e0e817830ad6b51767a380">
//                       Category 2
//                     </MenuItem>
//                     <MenuItem value="60e0e817830ad6b51767a381">
//                       Category 3
//                     </MenuItem>
//                   </Select>
//                   {formik.touched.category && formik.errors.category && (
//                     <div className="error">{formik.errors.category}</div>
//                   )}
//                 </FormControl>
//               </div>
//               <div className="col-12">
//                 <TextField
//                   fullWidth
//                   id="outlined-required-description"
//                   name="description"
//                   onBlur={formik.handleBlur}
//                   onChange={formik.handleChange}
//                   value={formik.values.description}
//                   label="Description"
//                   multiline
//                   rows={4}
//                   error={
//                     formik.touched.description &&
//                     Boolean(formik.errors.description)
//                   }
//                   helperText={
//                     formik.touched.description && formik.errors.description
//                   }
//                 />
//               </div>
//               <div className="col-md-6">
//                 <Autocomplete
//                   options={egyptianGovernorates}
//                   value={governorate}
//                   onChange={handleGovernorateChange}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       label="Select Governorate"
//                       variant="outlined"
//                       error={
//                         formik.touched.location?.governorate &&
//                         Boolean(formik.errors.location?.governorate)
//                       }
//                       helperText={
//                         formik.touched.location?.governorate &&
//                         formik.errors.location?.governorate
//                       }
//                     />
//                   )}
//                 />
//               </div>
//               <div className="col-md-6">
//                 <Button
//                   variant="primary"
//                   onClick={handleShow}
//                   className="btn w-100 p-3"
//                 >
//                   Pick Location
//                 </Button>

//                 <Modal show={show} onHide={handleClose}>
//                   <Modal.Header closeButton>
//                     <Modal.Title>Pick Location</Modal.Title>
//                   </Modal.Header>
//                   <Modal.Body>
//                     <MapContainer
//                       center={center}
//                       zoom={13}
//                       style={containerStyle}
//                     >
//                       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                       <LocationMarker
//                         setSelectedLocation={setSelectedLocation}
//                       />
//                       {selectedLocation && (
//                         <Marker position={selectedLocation}></Marker>
//                       )}
//                     </MapContainer>
//                   </Modal.Body>
//                   <Modal.Footer>
//                     <Button variant="secondary" onClick={handleClose}>
//                       Close
//                     </Button>
//                     <Button variant="primary" onClick={handleLocationSave}>
//                       Save Changes
//                     </Button>
//                   </Modal.Footer>
//                 </Modal>
//               </div>
//               <div className="col-md-6">
//                 <div className="form-group">
//                   <label htmlFor="images" className="form-label">
//                     Upload Images (up to 3):
//                   </label>
//                   <input
//                     type="file"
//                     id="images"
//                     name="images"
//                     accept="image/*"
//                     multiple
//                     onChange={handleImagesChange}
//                     className="form-control"
//                   />
//                   {formik.touched.images && formik.errors.images && (
//                     <div
//                       className="error"
//                       style={{ color: "red", marginTop: "10px" }}
//                     >
//                       {formik.errors.images}
//                     </div>
//                   )}
//                   <div
//                     className="uploaded-images"
//                     style={{ marginTop: "10px" }}
//                   >
//                     {images.map((image, index) => (
//                       <div
//                         key={index}
//                         style={{
//                           display: "inline-block",
//                           marginRight: "10px",
//                         }}
//                       >
//                         <img
//                           src={URL.createObjectURL(image)}
//                           alt={`Landmark ${index + 1}`}
//                           style={{
//                             maxWidth: "100px",
//                             maxHeight: "100px",
//                             borderRadius: "8px",
//                             boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               style={{ marginTop: "16px", display: "block" }}
//               disabled={loading}
//             >
//               {loading ? "Submitting..." : "Submit"}
//             </Button>
//           </form>
//         </ModalContent>
//       </Modal>

//       {/* Update Category Modal */}
//       <Modal
//         aria-labelledby="unstyled-modal-title"
//         aria-describedby="unstyled-modal-description"
//         open={updateOpen}
//         onClose={handleUpdateClose}
//         slots={{ backdrop: StyledBackdrop }}
//       >
//         <ModalContent sx={{ width: 400 }}>
//           <h2 id="unstyled-modal-title" className="modal-title text-center">
//             Update Category
//           </h2>
//           <form className="mt-5" onSubmit={updateFormik.handleSubmit}>
//             <TextField
//               style={{ width: "100%" }}
//               className="formField"
//               id="name"
//               name="name"
//               onBlur={updateFormik.handleBlur}
//               onChange={updateFormik.handleChange}
//               value={updateFormik.values.name}
//               label="Name"
//               error={
//                 updateFormik.touched.name && Boolean(updateFormik.errors.name)
//               }
//             />
//             {updateFormik.touched.name && updateFormik.errors.name && (
//               <div className="error">{updateFormik.errors.name}</div>
//             )}
//             <input
//               accept="image/*"
//               style={{ display: "none" }}
//               id="updateImageCover"
//               name="imageCover"
//               type="file"
//               onChange={handleUpdateFileChange}
//             />
//             <label htmlFor="updateImageCover">
//               <Button
//                 variant="contained"
//                 color="primary"
//                 component="span"
//                 style={{ marginTop: "16px", display: "block" }}
//               >
//                 Upload Image
//               </Button>
//             </label>
//             {imagePreview && (
//               <div style={{ marginTop: "16px" }}>
//                 <img src={imagePreview} alt="Preview" height="100" />
//               </div>
//             )}
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               style={{ marginTop: "16px", display: "block" }}
//             >
//               Submit
//             </Button>
//           </form>
//         </ModalContent>
//       </Modal>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteOpen}
//         onClose={handleDeleteClose}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">{"Delete Category"}</DialogTitle>
//         <DialogContent>
//           <DialogContentText id="alert-dialog-description">
//             Are you sure you want to delete the category "
//             {selectedCategory?.name}"?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeleteClose} color="primary">
//             Cancel
//           </Button>
//           <Button
//             onClick={() => deleteMutation.mutate(selectedCategory._id)}
//             color="error"
//             autoFocus
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }

// // Modal Backdrop and Content styling
// const Backdrop = forwardRef((props, ref) => {
//   const { open, className, ...other } = props;
//   return (
//     <div
//       className={clsx({ "base-Backdrop-open": open }, className)}
//       ref={ref}
//       {...other}
//     />
//   );
// });

// Backdrop.propTypes = {
//   className: PropTypes.string.isRequired,
//   open: PropTypes.bool,
// };

// const grey = {
//   50: "#F3F6F9",
//   100: "#E5EAF2",
//   200: "#DAE2ED",
//   300: "#C7D0DD",
//   400: "#B0B8C4",
//   500: "#9DA8B7",
//   600: "#6B7A90",
//   700: "#434D5B",
//   800: "#303740",
//   900: "#1C2025",
// };

// const Modal = styled(BaseModal)`
//   position: fixed;
//   z-index: 1300;
//   inset: 0;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

// const StyledBackdrop = styled(Backdrop)`
//   z-index: -1;
//   position: fixed;
//   inset: 0;
//   background-color: rgb(0 0 0 / 0.5);
//   -webkit-tap-highlight-color: transparent;
// `;

// const ModalContent = styled("div")(
//   ({ theme }) => css`
//     font-family: "IBM Plex Sans", sans-serif;
//     font-weight: 500;
//     text-align: start;
//     position: relative;
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//     overflow: hidden;
//     background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
//     border-radius: 8px;
//     border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
//     box-shadow: 0 4px 12px
//       ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
//     padding: 24px;
//     color: ${theme.palette.mode === "dark" ? grey[50] : grey[900]};

//     & .modal-title {
//       margin: 0;
//       line-height: 1.5rem;
//       margin-bottom: 8px;
//     }

//     & .modal-description {
//       margin: 0;
//       line-height: 1.5rem;
//       font-weight: 400;
//       color: ${theme.palette.mode === "dark" ? grey[400] : grey[800]};
//       margin-bottom: 4px;
//     }
//   `
// );
