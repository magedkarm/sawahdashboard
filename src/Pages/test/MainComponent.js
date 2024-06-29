import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableComponent from "./TableComponent";
import FormModal from "./FormModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

const MainComponent = ({
  entityName,
  entityApiPath,
  columns,
  initialValues,
}) => {
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setImagePreview(null);
  };

  const handleUpdateOpen = (item) => {
    setSelectedItem(item);
    setUpdateOpen(true);
  };
  const handleUpdateClose = () => {
    setUpdateOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteOpen = (item) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedItem(null);
  };

  const getAllItems = async () => {
    const response = await axios.get(entityApiPath);
    return response.data;
  };

  const { data, isLoading, error } = useQuery(entityName, getAllItems);

  const deleteMutation = useMutation(
    (itemId) =>
      axios.delete(`${entityApiPath}/${itemId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    {
      onSuccess: () => {
        toast.success(`${entityName} deleted successfully!`, {
          position: "top-center",
        });
        queryClient.invalidateQueries(entityName);
        handleDeleteClose();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  const addMutation = useMutation(
    (newItem) => {
      const formData = new FormData();
      for (let key in newItem) {
        formData.append(key, newItem[key]);
      }

      return axios.post(entityApiPath, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        toast.success(`${entityName} added successfully!`, {
          position: "top-center",
        });
        queryClient.invalidateQueries(entityName);
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
    ({ id, updatedItem }) => {
      const formData = new FormData();
      for (let key in updatedItem) {
        formData.append(key, updatedItem[key]);
      }

      return axios.patch(`${entityApiPath}/${id}`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
    },
    {
      onSuccess: () => {
        toast.success(`${entityName} updated successfully!`, {
          position: "top-center",
        });
        queryClient.invalidateQueries(entityName);
        handleUpdateClose();
        setImagePreview(null);
      },
      onError: (error) => {
        toast.error(`Error: ${error.response.data.message}`, {
          position: "top-center",
        });
      },
    }
  );

  const handleAddSubmit = (values) => {
    addMutation.mutate(values);
  };

  const handleUpdateSubmit = (values) => {
    updateMutation.mutate({
      id: selectedItem._id,
      updatedItem: values,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedItem._id);
  };

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) return <div>Loading...</div>;
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
              {entityName}
            </span>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">All {entityName}s</h4>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Add {entityName} <i className="ps-3 fa-solid fa-plus"></i>
              </Button>
            </div>
            <div className="card-body">
              <TableComponent
                data={data.data.docs}
                columns={columns}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                handleUpdateOpen={handleUpdateOpen}
                handleDeleteOpen={handleDeleteOpen}
                getDetails={async (id) => {
                  try {
                    const { data: itemDetails } = await axios.get(
                      `${entityApiPath}/${id}`,
                      {}
                    );
                    setImagePreview(itemDetails.data.doc.imageCover);
                  } catch (e) {
                    console.log(e);
                  }
                }}
                setImagePreview={setImagePreview}
              />
            </div>
          </div>
        </div>
      </div>
      <FormModal
        open={open}
        handleClose={handleClose}
        handleSubmit={handleAddSubmit}
        imagePreview={imagePreview}
        handleFileChange={handleFileChange}
        title={`Add New ${entityName}`}
        initialValues={initialValues}
      />
      <FormModal
        open={updateOpen}
        handleClose={handleUpdateClose}
        handleSubmit={handleUpdateSubmit}
        imagePreview={imagePreview}
        handleFileChange={handleFileChange}
        title={`Update ${entityName}`}
        initialValues={selectedItem || initialValues}
      />
      <DeleteConfirmationDialog
        open={deleteOpen}
        handleClose={handleDeleteClose}
        handleDelete={handleDelete}
        selectedItem={selectedItem}
        itemName={entityName}
      />
    </>
  );
};

export default MainComponent;
