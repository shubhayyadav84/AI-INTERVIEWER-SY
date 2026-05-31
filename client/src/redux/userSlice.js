import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
  theme: localStorage.getItem("theme") || "light",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      state.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
    },
  },
});

export const { setUser, setLoading, clearUser, toggleTheme } = userSlice.actions;
export default userSlice.reducer;
