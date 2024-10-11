import React, { forwardRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { useTheme } from "@mui/material/styles";

const borderAnimation = keyframes`
  0% {
    border-color: transparent;
    border-top-color: #047AF2;
  }
  25% {
    border-color: transparent;
    border-right-color: #047AF2;
  }
  50% {
    border-color: transparent;
    border-bottom-color: #047AF2;
  }
  75% {
    border-color: transparent;
    border-left-color: #047AF2;
  }
  100% {
    border-color: transparent;
    border-top-color: #047AF2;
  }
`;

const SearchBoxContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 200px;
  margin: 0px auto;
  margin-bottom: 0px;
  transition: all 0.3s ease;
`;

const SearchInput = styled.input`
  width: 100%;
  height: ${(props) => (props.$isFocused ? "70px" : "40px")};
  padding: 0 30px;
  border: 2px solid transparent;
  border-radius: 100px;
  outline: none;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.theme.palette.mode === "dark" ? "#000" : "#fff"};
  color: ${(props) => (props.theme.palette.mode === "dark" ? "#fff" : "#000")};

  &::placeholder {
    color: ${(props) =>
      props.theme.palette.mode === "dark" ? "#ddd" : "#888"};
  }

  &:focus {
    border-color: #047af2;
  }

  ${(props) =>
    !props.$isFocused &&
    css`
      animation: ${borderAnimation} 2s linear infinite;
    `}
`;

const SearchBox = React.memo(forwardRef(
  (
    {
      menuQuery,
      setMenuQuery,
      isSearchFocused,
      setIsSearchFocused,
      handleMenuSearch,
      autoFocus,
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <SearchBoxContainer>
        <SearchInput
          type="text"
          placeholder="Dynamic Search..."
          value={menuQuery}
          onChange={(e) => setMenuQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          $isFocused={isSearchFocused}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleMenuSearch(e);
            }
          }}
          theme={theme}
          autoFocus={autoFocus}
          ref={ref}
        />
      </SearchBoxContainer>
    );
  }
));

SearchBox.displayName = 'SearchBox';

export default SearchBox;
