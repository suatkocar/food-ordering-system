import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import { Select, MenuItem } from "@mui/material";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-cellEditable": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .MuiDataGrid-footerContainer": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  "& .MuiDataGrid-cell": {
    padding: 0,
  },
  "& .MuiDataGrid-columnHeader": {
    padding: 0,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  height: "100%",
  width: "100%",
  "&.MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "&.MuiInputBase-root": {
    "&.Mui-focused": {
      backgroundColor: "transparent",
    },
  },
  "& .MuiSelect-select": {
    height: "100%",
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const OrderStatusSelect = ({ value, onChange, orderStatusOptions }) => (
  <StyledSelect value={value || ""} onChange={onChange} fullWidth>
    {orderStatusOptions.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
  </StyledSelect>
);

const CustomFooter = (props) => {
  const { paginationProps } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
      }}
    >
      <div>
        {paginationProps.labelRowsPerPage} {paginationProps.rowsPerPageOptions}
      </div>
      <div>{paginationProps.labelDisplayedRows}</div>
    </div>
  );
};

const DesktopDataGrid = ({
  rows,
  columns,
  getRowId,
  loading,
  processRowUpdate,
  handleProcessRowUpdateError,
  onRowSelectionModelChange,
  selectedRowIds,
  paginationModel,
  handlePaginationModelChange,
  rowCount,
  getRowHeight,
  orderStatusOptions,
}) => {
  const updatedColumns = columns.map((column) => {
    if (column.field === "OrderStatus") {
      return {
        ...column,
        renderCell: (params) => (
          <OrderStatusSelect
            value={params.value}
            onChange={(e) => {
              const updatedRow = { ...params.row, OrderStatus: e.target.value };
              processRowUpdate(updatedRow, params.row);
            }}
            onClick={(e) => e.stopPropagation()}
            orderStatusOptions={orderStatusOptions}
          />
        ),
      };
    }
    return column;
  });

  return (
    <StyledDataGrid
      autoHeight
      checkboxSelection
      rows={rows}
      columns={updatedColumns}
      getRowId={getRowId}
      pageSizeOptions={[10, 20, 50]}
      pagination
      paginationMode="server"
      rowCount={rowCount}
      loading={loading}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      onRowSelectionModelChange={onRowSelectionModelChange}
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}
      density="standard"
      disableSelectionOnClick
      getRowHeight={getRowHeight}
      rowHeight={
        typeof getRowHeight === "function" ? getRowHeight() : undefined
      }
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 20 },
        },
      }}
      components={{
        Footer: CustomFooter,
      }}
    />
  );
};

export default DesktopDataGrid;
