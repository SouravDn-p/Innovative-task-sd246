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
    // Hydrate from NextAuth session after client-side mount
    hydrate(state) {
      // With NextAuth, we don't hydrate from localStorage
      // Session state is managed by NextAuth
      state.isHydrated = true;
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

      // With NextAuth, we don't persist to localStorage
      // Session persistence is handled by NextAuth
    },
    loginFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;

      // With NextAuth, we don't need to clear localStorage
      // Session cleanup is handled by NextAuth
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
        state.token = null;
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
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
