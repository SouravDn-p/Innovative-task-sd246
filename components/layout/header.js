"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  Users,
  Shield,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { logout } from "@/redux/slice/authSlice";

const getDashboardRoute = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "advertiser") return "/dashboard/advertiser";
  return "/dashboard/user";
};

const getRoleSpecificLinks = (role) => {
  switch (role) {
    case "admin":
      return [
        {
          name: "Task Management",
          href: "/dashboard/admin/tasks",
          icon: Briefcase,
        },
        { name: "Referrals", href: "/dashboard/admin/users", icon: Users },
        {
          name: "KYC Management",
          href: "/dashboard/admin/kyc-management",
          icon: Shield,
        },
      ];
    case "advertiser":
      return [
        {
          name: "Create Task",
          href: "/dashboard/advertiser/create-task",
          icon: Briefcase,
        },
        { name: "Active Tasks", href: "/dashboard/advertiser", icon: Users },
        {
          name: "Analytics",
          href: "/dashboard/advertiser/analytics",
          icon: Shield,
        },
      ];
    case "user":
    default:
      return [
        { name: "Referrals", href: "/dashboard/user/referrals", icon: Users },
        { name: "Tasks", href: "/dashboard/user/task", icon: Briefcase },
        { name: "Wallet", href: "/dashboard/user/wallet", icon: Shield },
      ];
  }
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const userRole = session?.user?.role?.toLowerCase() || "user";

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

  // Get role-specific dashboard link
  const dashboardLink = getDashboardRoute(userRole);
  const roleSpecificLinks = getRoleSpecificLinks(userRole);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-teal-600 shadow-sm"
            >
              <Image
                src="/logos/logo.png"
                alt="TaskEarn Logo"
                height={20}
                width={20}
                className="sm:h-6 sm:w-6"
              />
            </motion.div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                TaskEarn
              </span>
              <span className="hidden sm:block text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                Smart task matching
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="relative text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-teal-600"
            >
              <span className="inline-block py-1.5 px-1 cursor-pointer">
                Home
              </span>
            </Link>
            <Link
              href="dashboard/user/task"
              className="relative text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-teal-600"
            >
              <span className="inline-block py-1.5 px-1 cursor-pointer">
                Tasks
              </span>
            </Link>
            <Link
              href="/about"
              className="relative text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-teal-600"
            >
              <span className="inline-block py-1.5 px-1 cursor-pointer">
                About
              </span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {status === "authenticated" && session ? (
              <div className="relative flex items-center gap-1.5">
                {/* Desktop Dashboard Button */}
                <Link
                  href={dashboardLink}
                  className="hidden md:flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-500 transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-1.5">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 rounded-full px-1 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt="User Avatar"
                      width={24}
                      height={24}
                      className="rounded-full border border-gray-300 dark:border-gray-700"
                    />
                    <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-9 w-40 sm:w-44 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="px-2.5 py-2 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {session.user.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {userRole} Account
                          </p>
                        </div>
                        <Link
                          href={dashboardLink}
                          className="block px-3 py-2 text-xs sm:text-sm hover:bg-teal-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-1.5 px-3 py-2 text-xs sm:text-sm hover:bg-teal-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5 text-red-500" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1 text-xs hover:text-teal-100 cursor-pointer"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-2.5 py-1 text-xs bg-teal-600 hover:bg-teal-500 text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
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
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
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
              className="sidebar z-[9999] w-[85vw] max-w-[300px] min-w-[260px] bg-white dark:bg-gray-900 shadow-xl flex flex-col md:hidden"
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                height: "100vh",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
                {session ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Image
                      src={session?.user?.image || "/default-avatar.png"}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">
                        {session?.user?.name}
                      </span>
                      <span className="text-[10px] opacity-90 capitalize">
                        {userRole} Account
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="font-semibold text-base">Menu</span>
                )}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-1.5 hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0 ml-1"
                  aria-label="Close menu"
                >
                  <X className="h-4.5 w-4.5 text-white" />
                </button>
              </div>

              {/* Navigation (scrollable middle section) */}
              <nav className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-0.5">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-all duration-200 cursor-pointer"
                >
                  <span>Home</span>
                </Link>
                <Link
                  href="/tasks"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-all duration-200 cursor-pointer"
                >
                  <span>Tasks</span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-all duration-200 cursor-pointer"
                >
                  <span>About</span>
                </Link>

                {/* Role-specific links */}
                {session && (
                  <>
                    <div className="pt-1.5 pb-1 border-t border-gray-200 dark:border-gray-700 mt-1.5">
                      <h3 className="px-2.5 py-1.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dashboard
                      </h3>
                    </div>
                    <Link
                      href={dashboardLink}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-all duration-200 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>

                    {roleSpecificLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-teal-600 transition-all duration-200 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* Footer (sticks at bottom) */}
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {session ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-md bg-teal-600 text-white px-3 py-2.5 text-sm font-medium hover:bg-teal-500 transition-all duration-200 hover:scale-[1.02] cursor-pointer">
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
