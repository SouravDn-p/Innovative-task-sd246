"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { logout } from "@/redux/slice/authSlice";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Tasks", href: "/tasks" },
  { name: "Referrals", href: "/referrals" },
  { name: "About", href: "/about" },
];

const getDashboardRoute = (role) => {
  if (role === "admin") return "/dashboard";
  if (role === "advertiser") return "/dashboard";
  return "/dashboard";
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  // Show login toast once per session
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const hasWelcomed = sessionStorage.getItem("welcomed");
      if (!hasWelcomed) {
        Swal.fire({
          toast: true,
          icon: "success",
          title: `Hi ${session.user.name}!`,
          text: "You are logged in 🎉",
          position: "top-end",
          timer: 1800,
          showConfirmButton: false,
          background: "#1e3a8a",
          color: "#fff",
          customClass: {
            popup: "max-w-xs w-full text-sm break-words", // fixes overflow
            title: "truncate text-ellipsis", // keep title short
          },
        });
        sessionStorage.setItem("welcomed", "true");
      }
    }
  }, [status, session]);

  // Lock scroll when sidebar open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Logout with confirmation
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be signed out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign out",
      cancelButtonText: "Cancel",
      background: "#1e3a8a",
      color: "#fff",
    });

    if (result.isConfirmed) {
      dispatch(logout());
      await signOut({ redirect: false });
      Swal.fire({
        toast: true,
        icon: "info",
        title: "Signed out successfully",
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
        background: "#1e3a8a",
        color: "#fff",
      });
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
    }
  };

  // Close sidebar when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target.closest(".sidebar") === null) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-md"
            >
              <Image
                src="/logos/logo.png"
                alt="TaskEarn Logo"
                height={32}
                width={32}
              />
            </motion.div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                TaskEarn
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Smart task matching
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-teal-600"
              >
                <span className="inline-block py-2 px-1 cursor-pointer">
                  {link.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {status === "authenticated" && session ? (
              <div className="relative hidden md:flex items-center gap-3">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Image
                    src={session.user?.image || "/default-avatar.png"}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-300 dark:border-gray-700"
                  />
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-52 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <Link
                        href={getDashboardRoute(session.user?.role)}
                        className="block px-4 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-2 hover:text-teal-100 cursor-pointer"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white shadow-md hover:scale-105 transition-transform cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              onClick={handleOutsideClick}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="sidebar z-[9999] w-[85vw] max-w-[400px] min-w-[320px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col md:hidden"
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                height: "100vh",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
                {session ? (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Image
                      src={session?.user?.image || "/default-avatar.png"}
                      alt="User Avatar"
                      width={44}
                      height={44}
                      className="rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-lg truncate">
                        {session?.user?.name}
                      </span>
                      <span className="text-sm opacity-90">
                        Welcome back 👋
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="font-semibold text-xl">Menu</span>
                )}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-3 hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0 ml-3"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Navigation (scrollable middle section) */}
              <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-4 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-all duration-200 cursor-pointer"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Footer (sticks at bottom) */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {session ? (
                  <div className="space-y-4">
                    <Link
                      href={getDashboardRoute(session.user?.role)}
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center rounded-lg bg-teal-600 text-white px-4 py-4 text-lg font-medium hover:bg-teal-500 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-4 text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-lg bg-teal-600 text-white px-4 py-4 text-lg font-medium hover:bg-teal-500 transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
