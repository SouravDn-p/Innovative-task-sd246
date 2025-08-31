"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Fullscreen,
  Minimize2,
  ListCollapse,
  AlignLeft,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Link from "next/link";

const DashboardHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error trying to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserRole = () => {
    if (user?.role) {
      return user.role.toLowerCase();
    }
    return "user";
  };

  const getProfilePath = () => {
    const role = getUserRole();
    switch (role) {
      case "advertiser":
        return "/dashboard/advertiser/profile";
      case "admin":
        return "/dashboard/admin/profile";
      default:
        return "/dashboard/user/profile";
    }
  };

  const getSettingsPath = () => {
    const role = getUserRole();
    switch (role) {
      case "advertiser":
        return "/dashboard/advertiser/settings";
      case "admin":
        return "/dashboard/admin/settings";
      default:
        return "/dashboard/user/settings";
    }
  };

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-teal-200 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0 shadow-sm w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-teal-50 transition-colors duration-200"
          >
            {isSidebarOpen ? (
              <ListCollapse className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            ) : (
              <AlignLeft className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-teal-600 border-teal-200 hover:bg-teal-50 bg-transparent transition-colors duration-200 text-xs sm:text-sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-teal-600" />
            <span className="hidden sm:inline">Refresh</span>
            {user?.name ? ` (${user.name})` : ""}
          </Button>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="transition-colors duration-200 hover:bg-teal-50 p-2"
          >
            {isFullscreen ? (
              <Minimize2 className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            ) : (
              <Fullscreen className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            )}
          </Button>

          {status === "loading" ? (
            <div className="h-8 w-24 sm:h-10 sm:w-32 bg-gray-200 animate-pulse rounded-full"></div>
          ) : session ? (
            <div className="relative" ref={profileMenuRef}>
              <Button
                variant="ghost"
                className="relative h-8 w-auto px-2 sm:h-10 sm:px-3 rounded-full bg-teal-50 hover:bg-teal-100 transition-colors duration-200 shadow-sm"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage
                      src={user?.image || "/placeholder.svg?height=32&width=32"}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-teal-500 text-white text-xs sm:text-sm">
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-20 sm:max-w-24">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-teal-600 capitalize truncate">
                      {getUserRole()}
                    </p>
                  </div>
                </div>
              </Button>

              {isProfileMenuOpen && (
                <div
                  className={cn(
                    "absolute right-0 mt-2 w-48 sm:w-56 rounded-xl border border-teal-200 bg-white p-1 text-popover-foreground shadow-xl z-50",
                    "origin-top-right animate-in fade-in-0 zoom-in-95"
                  )}
                >
                  <div className="px-2 py-2 border-b border-teal-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-teal-600 capitalize font-medium">
                      {getUserRole()} Account
                    </p>
                  </div>

                  <div className="py-1">
                    <Link href={getProfilePath()}>
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-teal-50 focus:bg-teal-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4 text-teal-600" />
                        <span>My Profile</span>
                      </button>
                    </Link>
                    <Link href={getSettingsPath()}>
                      <button
                        className="flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-teal-50 focus:bg-teal-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4 text-teal-600" />
                        <span>Settings</span>
                      </button>
                    </Link>
                  </div>

                  <div className="my-1 h-px bg-teal-100 -mx-1" />

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
