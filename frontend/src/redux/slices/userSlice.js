import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { resetCart } from "./cartSlice";

let initialState = {
  user: null,
  token: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  redirectUrl: "/",
};

try {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  if (storedUser && storedUser !== "undefined") {
    initialState.user = JSON.parse(storedUser);
  }
  if (storedToken && storedToken !== "undefined") {
    initialState.token = storedToken;
  }
} catch (error) {
  console.error("Failed to parse user or token from localStorage:", error);
}

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (userData, { rejectWithValue }) => {
    const { id, name, email, oldPassword, newPassword, role } = userData;

    if (!id) {
      console.error("updateUser thunk: UserID is missing.");
      return rejectWithValue("UserID is missing.");
    }

    console.log("Sending update request with data:", userData);

    try {
      const response = await axiosInstance.put(`/users/${id}`, {
        name: name || undefined,
        email: email || undefined,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined,
        role: role || undefined,
      });
      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in updateUser thunk:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/users`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.redirectUrl = action.payload.redirectUrl || "/";

      try {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      } catch (error) {
        console.error("Failed to save user or token to localStorage:", error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.redirectUrl = "/signin";

      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } catch (error) {
        console.error(
          "Failed to remove user or token from localStorage:",
          error
        );
      }
    },
    resetUser: (state) => {
      state.user = null;
      state.token = null;
      state.redirectUrl = "/";
    },
    setRedirectUrl: (state, action) => {
      state.redirectUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;

        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch (error) {
          console.error("Failed to save updated user to localStorage:", error);
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { loginSuccess, logout, resetUser, setRedirectUrl } =
  userSlice.actions;

export const handleLogout = () => async (dispatch) => {
  try {
    await axiosInstance.post("/logout");
    dispatch(logout());
    dispatch(resetCart());
    delete axiosInstance.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("Failed to handle logout:", error);
  }
};

export default userSlice.reducer;
