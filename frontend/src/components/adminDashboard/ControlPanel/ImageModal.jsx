import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadIcon from '@mui/icons-material/Upload';

const ModalImageContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
});

const OverlayIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.7)'
      : 'rgba(255, 255, 255, 0.7)',
  transition: 'opacity 0.3s ease-in-out',
  opacity: 0,
  '&:hover': {
    opacity: 1,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(0, 0, 0, 1)'
        : 'rgba(255, 255, 255, 1)',
  },
}));

const ImageModal = ({ open, handleClose, selectedImage, handleFileChange }) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogContent style={{ position: 'relative', padding: 0 }}>
        {selectedImage && (
          <ModalImageContainer>
            <img
              src={selectedImage}
              alt="Selected"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <OverlayIconButton component="label">
              <UploadIcon />
              <input type="file" hidden onChange={handleFileChange} />
            </OverlayIconButton>
          </ModalImageContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
