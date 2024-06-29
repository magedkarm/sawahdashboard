import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
} from "@mui/material";

const TableComponent = ({
  data,
  columns,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleUpdateOpen,
  handleDeleteOpen,
  getDetails,
  setImagePreview,
}) => {
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const visibleRows = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field} align={column.align || "left"}>
                {column.headerName}
              </TableCell>
            ))}
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row, ind) => (
            <TableRow
              key={row._id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {ind + 1}
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.field} align={column.align || "left"}>
                  {column.renderCell
                    ? column.renderCell(row[column.field])
                    : row[column.field]}
                </TableCell>
              ))}
              <TableCell align="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    getDetails(row._id);
                    handleUpdateOpen(row);
                    setImagePreview(row.imageCover);
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
              <TableCell colSpan={columns.length + 1} />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default TableComponent;
