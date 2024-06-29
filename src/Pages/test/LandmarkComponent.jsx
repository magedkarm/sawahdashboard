import React from "react";
import MainComponent from "./MainComponent";
// Adjust the import path as needed

const LandmarkComponent = () => {
  const landmarkColumns = [
    { field: "name", headerName: "Name", align: "center" },
    {
      field: "imageCover",
      headerName: "Image",
      align: "center",
      renderCell: (imageCover) => (
        <img src={imageCover} alt="landmark" height="100" />
      ),
    },
    { field: "description", headerName: "Description", align: "center" },
    // Add other columns specific to landmarks here
  ];

  const landmarkInitialValues = {
    name: "",
    imageCover: null,
    description: "",
    // Add other initial fields for landmarks here
  };
  return (
    <MainComponent
      entityName="Landmark"
      entityApiPath="/api/v1/landmarks" // Replace with the actual API path for landmarks
      columns={landmarkColumns}
      initialValues={landmarkInitialValues}
    />
  );
};

export default LandmarkComponent;
