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
  if (role === "admin") return "/dashboard/admin";
  if (role === "advertiser") return "/dashboard/advertiser";
  return "/dashboard/user";
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  // Show login toast when session changes to authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
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
      });
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

  // Handle logout with confirmation
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg dark:bg-gray-900/70 border-b border-gray-100 dark:border-gray-800 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-lg"
            >
              <Image src="/logos/logo.png" alt="TaskEarn Logo" height={32} width={32} />
            </motion.div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">TaskEarn</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Smart task matching</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-teal-600"
              >
                <span className="inline-block py-2 px-1 cursor-pointer">{link.name}</span>
              </Link>
            ))}
          </nav>

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
                  <Button variant="ghost" size="sm" className="px-3 py-2 hover:text-teal-600 cursor-pointer">
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

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Image
                    src={session?.user?.image || "/default-avatar.png"}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className="rounded-full border border-gray-300 dark:border-gray-700"
                  />
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {session?.user?.name || "Guest"}
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto">
                {session ? (
                  <div className="flex flex-col gap-3 mt-6">
                    <Link
                      href={getDashboardRoute(session.user?.role)}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center rounded-md bg-teal-600 text-white px-3 py-2 text-sm font-medium hover:bg-teal-500 transition cursor-pointer"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-800 transition cursor-pointer">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-md bg-teal-600 text-white px-3 py-2 text-sm font-medium hover:bg-teal-500 transition cursor-pointer">
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