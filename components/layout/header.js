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
            popup: "max-w-xs w-full text-sm break-words",
            title: "truncate text-ellipsis",
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

  // Animation variants for mobile sidebar
  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-teal-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 shadow-sm"
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
              <span className="text-sm sm:text-base font-bold text-teal-800">
                TaskEarn
              </span>
              <span className="hidden sm:block text-[10px] sm:text-xs text-teal-600">
                Smart task matching
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="relative text-xs sm:text-sm font-medium text-teal-700 hover:text-teal-500 transition-colors"
            >
              <span className="inline-block py-1.5 px-1 cursor-pointer">
                Home
              </span>
            </Link>
            <Link
              href="/dashboard/user/task"
              className="relative text-xs sm:text-sm font-medium text-teal-700 hover:text-teal-500 transition-colors"
            >
              <span className="inline-block py-1.5 px-1 cursor-pointer">
                Tasks
              </span>
            </Link>
            <Link
              href="/about"
              className="relative text-xs sm:text-sm font-medium text-teal-700 hover:text-teal-500 transition-colors"
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
                  className="hidden md:flex items-center gap-1 rounded-md bg-gradient-to-r from-teal-500 to-cyan-500 px-2 py-1 text-xs font-medium text-white hover:bg-teal-600 transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-1.5">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 rounded-full px-1 py-1 cursor-pointer hover:bg-teal-100 transition"
                  >
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt="User Avatar"
                      width={24}
                      height={24}
                      className="rounded-full border border-teal-200"
                    />
                    <ChevronDown className="h-3 w-3 text-teal-600" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-9 w-44 rounded-md shadow-lg bg-white border border-teal-200 overflow-hidden"
                      >
                        <div className="px-2.5 py-2 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                          <p className="text-sm font-medium text-teal-800 truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-teal-600 capitalize">
                            {userRole} Account
                          </p>
                        </div>
                        <Link
                          href={dashboardLink}
                          className="block px-3 py-2 text-sm text-teal-700 hover:bg-teal-100 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-1.5 px-3 py-2 text-sm text-teal-700 hover:bg-teal-100 cursor-pointer"
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
                    className="px-2 py-1 text-xs text-teal-700 hover:text-teal-500 cursor-pointer"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-2.5 py-1 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:bg-teal-600 text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
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
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-teal-100 transition-colors cursor-pointer"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-teal-600" />
                ) : (
                  <Menu className="h-5 w-5 text-teal-600" />
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
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="sidebar z-[9999] w-[85vw] max-w-[300px] min-w-[260px] bg-white shadow-lg flex flex-col md:hidden border-l border-teal-200"
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                height: "100vh",
              }}
            >
              {/* Header */}
              <div className="p-4 border-b border-teal-100 flex items-center justify-between bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                {session ? (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Image
                        src={session?.user?.image || "/default-avatar.png"}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white shadow-sm flex-shrink-0"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-sm text-white truncate">
                        {session?.user?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 bg-teal-700 rounded-full text-white text-xs font-semibold capitalize">
                          {userRole}
                        </span>
                        <span className="text-xs text-teal-100">Online</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-cyan-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-md">
                      TE
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">TaskEarn</h2>
                      <p className="text-xs text-teal-100">Smart task matching</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-2 hover:bg-teal-600 transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Navigation (scrollable middle section) */}
              <nav className="flex-1 overflow-y-auto py-4">
                <motion.ul
                  className="space-y-1 p-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer transition-colors duration-200 shadow-sm"
                    >
                      <span className="text-sm font-medium">Home</span>
                    </Link>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/dashboard/user/task"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer transition-colors duration-200 shadow-sm"
                    >
                      <span className="text-sm font-medium">Tasks</span>
                    </Link>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer transition-colors duration-200 shadow-sm"
                    >
                      <span className="text-sm font-medium">About</span>
                    </Link>
                  </motion.li>

                  {/* Role-specific links */}
                  {session && (
                    <>
                      <motion.li variants={itemVariants} className="pt-4">
                        <div className="px-4 py-2 text-xs font-semibold text-teal-600 uppercase tracking-wider">
                          Dashboard
                        </div>
                      </motion.li>
                      <motion.li variants={itemVariants}>
                        <Link
                          href={dashboardLink}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer transition-colors duration-200 shadow-sm"
                        >
                          <User className="h-5 w-5 text-teal-600" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                      </motion.li>
                      {roleSpecificLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <motion.li key={link.name} variants={itemVariants}>
                            <Link
                              href={link.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer transition-colors duration-200 shadow-sm"
                            >
                              <Icon className="h-5 w-5 text-teal-600" />
                              <span className="text-sm font-medium">{link.name}</span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </>
                  )}
                </motion.ul>
              </nav>

              {/* Footer (sticks at bottom) */}
              <div className="p-4 border-t border-teal-100 mt-auto bg-gradient-to-t from-teal-50 to-white">
                {session ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-teal-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-500 hover:text-white transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-lg border border-teal-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors duration-200 shadow-sm">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 text-sm font-medium hover:bg-teal-600 transition-colors duration-200 shadow-sm hover:scale-[1.02]">
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
                <div className="text-center mt-4">
                  <p className="text-xs text-teal-600">TaskEarn v1.0.0</p>
                  <p className="text-[10px] text-teal-400 mt-1">
                    © 2025 All Rights Reserved
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}