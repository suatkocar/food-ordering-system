import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-cellEditable": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .MuiDataGrid-footerContainer": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "52px",
  },
  "& .MuiTablePagination-root": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiTablePagination-selectLabel": {
    marginBottom: 0,
  },
  "& .MuiTablePagination-displayedRows": {
    marginBottom: 0,
  },
  "& .MuiTablePagination-select": {
    marginRight: theme.spacing(1),
  },
  "& .MuiDataGrid-cell": {
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-columnHeader": {
    padding: theme.spacing(1),
  },
}));

const DesktopDataGrid = ({
  rows,
  columns,
  getRowId,
  loading,
  onRowSelectionModelChange,
  selectedRowIds,
  paginationModel,
  handlePaginationModelChange,
  rowCount,
}) => {
  return (
    <StyledDataGrid
      autoHeight
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      pageSizeOptions={[10, 20, 50]}
      pagination
      paginationMode="server"
      rowCount={rowCount}
      loading={loading}
      onRowSelectionModelChange={onRowSelectionModelChange}
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}
      density="standard"
      disableSelectionOnClick
      getRowHeight={() => 'auto'}
    />
  );
};

export default DesktopDataGrid;
