import React from 'react';
import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import Alert from '@mui/material/Alert';

const StyledAlert = styled(Alert, {
  shouldForwardProp: (prop) => prop !== 'variantType',
})(({ theme, severity, variantType }) => {
  let backgroundColor;
  let textColor;
  let additionalStyles = {};

  if (variantType === 'severity') {
    switch (severity) {
      case 'success':
        backgroundColor = theme.palette.success.main;
        textColor = "white";
        break;
      case 'error':
        backgroundColor = theme.palette.error.main;
        textColor = theme.palette.error.contrastText;
        break;
      case 'warning':
        backgroundColor = theme.palette.warning.main;
        textColor = theme.palette.warning.contrastText;
        break;
      case 'info':
      default:
        backgroundColor = theme.palette.info.main;
        textColor = theme.palette.info.contrastText;
        break;
    }
  } else {
    backgroundColor =
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.4)
        : alpha(theme.palette.background.default, 0.4);
    textColor =
      theme.palette.mode === 'dark'
        ? theme.palette.grey[100]
        : theme.palette.grey[900];
    additionalStyles = {
      backdropFilter: 'blur(24px)',
    };
  }

  return {
    width: '100%',
    backgroundColor,
    color: textColor,
    border: 'none',
    '& .MuiAlert-icon': {
      color: textColor,
    },
    ...additionalStyles,
  };
});

const CustomAlert = React.forwardRef((props, ref) => {
  const { severity, variantType, ...other } = props;
  return <StyledAlert ref={ref} severity={severity} variantType={variantType} {...other} />;
});

CustomAlert.propTypes = {
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']).isRequired,
  variantType: PropTypes.oneOf(['theme', 'severity']),
};

CustomAlert.defaultProps = {
  variantType: 'theme',
};

export default CustomAlert;
