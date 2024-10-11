import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import App from "./App.jsx";
import { store, persistor } from "./redux/store";
import getMPTheme from "./theme/getMPTheme";
import "./index.css";
import ErrorBoundary from './components/global/ErrorBoundary';

const root = createRoot(document.getElementById("root"));

const basename = import.meta.env.PROD ? "/food-ordering-system" : "/";
const isDevelopment = process.env.NODE_ENV === 'development';

const AppComponent = (
  <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={getMPTheme("light")}>
          <CssBaseline />
          <Router basename={basename}>
            <SnackbarProvider
              maxSnack={5}
              autoHideDuration={3000}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
                <App />
            </SnackbarProvider>
          </Router>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </ErrorBoundary>
);

root.render(
  isDevelopment ? <React.StrictMode>{AppComponent}</React.StrictMode> : AppComponent
);
