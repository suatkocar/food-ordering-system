import React from 'react';
import { Box, Button, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';

const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MobileToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  zIndex: 1,
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
}));

const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
}));

const FixedToolbar = ({ onAddNew, onDelete, disableDelete, isMobile, searchText, handleSearchChange }) => {
  if (isMobile) {
    return (
      <MobileToolbarContainer>
        <ButtonsContainer>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={onAddNew}
            size="small"
            fullWidth
          >
            Add New
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            variant="contained"
            color="secondary"
            onClick={onDelete}
            size="small"
            disabled={disableDelete}
            fullWidth
          >
            Delete Selected
          </Button>
        </ButtonsContainer>
        <StyledTextField
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search..."
          size="small"
          variant="outlined"

        />
      </MobileToolbarContainer>
    );
  }

  return (
    <ToolbarContainer>
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        color="primary"
        onClick={onAddNew}
        size="medium"
      >
        Add New
      </Button>
      <TextField
        value={searchText}
        onChange={handleSearchChange}
        placeholder="Search..."
        size="medium"
        variant="outlined"
        sx={{ marginLeft: 2, marginRight: 2, flexGrow: 1 }}
      />
      <Button
        startIcon={<DeleteIcon />}
        variant="contained"
        color="secondary"
        onClick={onDelete}
        size="medium"
        disabled={disableDelete}
      >
        Delete Selected
      </Button>
    </ToolbarContainer>
  );
};

export default FixedToolbar;
