import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { keyframes } from "@emotion/react";

const spin = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(0deg);
  }
`;

export default function SitemarkIcon(props) {
  return (
    <SvgIcon
      {...props}
      sx={{
        alignSelf: "center",
        height: "2.5rem",
        width: "5rem",
        cursor: "pointer",
        transition: 'filter 300ms',
        '&:hover': {
          filter: 'brightness(1.2) drop-shadow(0 0 12px #047AF2) drop-shadow(0 0 20px #047AF2)',
        },
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="256"
        height="256"
        viewBox="0 0 1024 1024"
      >
        <g>
          <path
            fill="#05D3AB"
            d="M405.333 390.4L345.6 450.133l392.533 392.534c17.067 17.066 42.667 17.066 59.734 0 17.066-17.067 17.066-42.667 0-59.734L405.333 390.4z"
          ></path>
          <path
            fill="#05D3AB"
            d="M339.2 565.333l121.6-121.6-296.533-294.4-12.8 10.667c-59.734 59.733-59.734 157.867 0 217.6L339.2 565.333z"
          ></path>
          <path
            fill="#047AF2"
            d="M663.467 462.933L603.733 403.2 221.867 782.933c-17.067 17.067-17.067 42.667 0 59.734 17.066 17.066 42.666 17.066 59.733 0l381.867-379.734z"
          ></path>
          <path
            fill="#047AF2"
            d="M602.125 221.825A170.667 213.333 45.001 10843.48 463.188a170.667 213.333 45.001 10-241.355-241.363z"
          ></path>
        </g>
      </svg>
    </SvgIcon>
  );
}
