"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  Search,
  Bell,
  Home,
  Workflow,
  Users,
  BarChart3,
  DollarSign,
  Settings,
  Database,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import ReduxProvider from "@/components/ReduxProvider";
import SessionWrapper from "@/components/SessionWrapper";

const navigation = {
  user: [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Tasks", href: "/dashboard/tasks", icon: Workflow },
    { name: "Referrals", href: "/dashboard/referrals", icon: Users },
    { name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
    { name: "Profile", href: "/dashboard/profile", icon: Settings },
  ],
  advertiser: [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Workflow },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Payments", href: "/dashboard/payments", icon: DollarSign },
    { name: "Profile", href: "/dashboard/profile", icon: Settings },
  ],
  admin: [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Tasks", href: "/dashboard/tasks", icon: Workflow },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Database },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
};

function DashboardContent({ children }) {
  const pathname = usePathname();
  const role = useSelector((state) => state?.auth?.role) || "user";
  const userNavigation = navigation[role] || navigation.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const breadcrumbTitle =
    pathname === "/dashboard"
      ? "Overview"
      : pathname
          .replace("/dashboard/", "")
          .replace(/^\w/, (c) => c.toUpperCase()) || "Overview";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 bg-white px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">TaskEarn</span>
          </div>
          <div className="hidden sm:block text-sm text-gray-500">
            <span>Dashboard</span> <span className="mx-1">/</span>
            <span className="capitalize">{breadcrumbTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`Search ${
                role === "admin"
                  ? "users, tasks, campaigns"
                  : role === "advertiser"
                  ? "campaigns, analytics"
                  : "tasks, referrals"
              }...`}
              className="pl-10 w-60 lg:w-80 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    {role.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex relative">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 fixed md:static top-16 left-0 z-50
            w-60 border-r border-gray-200 bg-white 
            h-[calc(100vh-4rem)] overflow-y-auto
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="p-4">
            <div className="relative mb-6 md:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search ${
                  role === "admin"
                    ? "users, tasks, campaigns"
                    : role === "advertiser"
                    ? "campaigns, analytics"
                    : "tasks, referrals"
                }...`}
                className="pl-10 bg-gray-50 border-gray-200 text-sm"
              />
            </div>

            <div className="relative mb-6 hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search anything..."
                className="pl-10 bg-gray-50 border-gray-200 text-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            <nav className="space-y-1">
              {userNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 p-3 bg-gray-50 rounded-lg md:hidden">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Current Role
              </div>
              <div className="text-sm font-medium text-gray-900 capitalize mt-1">
                {role}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <ReduxProvider>
      <SessionWrapper>
        <DashboardContent>{children}</DashboardContent>
      </SessionWrapper>
    </ReduxProvider>
  );
}
