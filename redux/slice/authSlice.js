import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  isHydrated: false, // Track hydration status
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Hydrate from localStorage after client-side mount
    hydrate(state) {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
          try {
            state.user = JSON.parse(storedUser);
            state.token = storedToken;
            state.isLoggedIn = true;
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            // Clear corrupted data
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
        state.isHydrated = true;
      }
    },
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;
      
      // Persist to localStorage on client side
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      }
    },
    loginFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
      state.isLoggedIn = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
      
      // Clear localStorage on client side
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    },
    // Sync with NextAuth session
    syncWithSession(state, action) {
      const { session } = action.payload;
      if (session?.user) {
        state.user = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          image: session.user.image,
        };
        state.isLoggedIn = true;
        state.loading = false;
        state.error = null;
      } else {
        state.user = null;
        state.isLoggedIn = false;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { 
  hydrate, 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  syncWithSession,
  clearError 
} = authSlice.actions;

export default authSlice.reducer;
