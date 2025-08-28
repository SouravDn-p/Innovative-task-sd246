"use client";

import { useSelector, useDispatch } from "react-redux";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for common auth state access
export const useAuth = () => {
  return useAppSelector((state) => ({
    user: state.auth.user,
    token: state.auth.token,
    isLoggedIn: state.auth.isLoggedIn,
    loading: state.auth.loading,
    error: state.auth.error,
    isHydrated: state.auth.isHydrated,
  }));
};

// Hook for checking user role
export const useUserRole = () => {
  return useAppSelector((state) => state.auth.user?.role || "user");
};

// Hook for checking if user is admin
export const useIsAdmin = () => {
  return useAppSelector((state) => state.auth.user?.role === "admin");
};

// Hook for checking if user is advertiser
export const useIsAdvertiser = () => {
  return useAppSelector((state) => state.auth.user?.role === "advertiser");
};

// Hook for getting user profile info
export const useUserProfile = () => {
  return useAppSelector((state) => ({
    id: state.auth.user?.id,
    name: state.auth.user?.name,
    email: state.auth.user?.email,
    image: state.auth.user?.image,
    role: state.auth.user?.role,
  }));
};
