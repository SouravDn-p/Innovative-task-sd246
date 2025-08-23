"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobiles";
import { ChevronLeft, Search, ChevronRight } from "lucide-react";
import getALLRoles from "@/lib/getALLRoles";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function DashboardSidebar({
  collapsed,
  setIsSidebarOpen,
  isMobile = false,
}) {
  const { data: session, status } = useSession();
  const role = session?.user?.userType?.toLowerCase() || "user";
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState([]);
  const isDesktopMobile = useIsMobile();
  const pathname = usePathname();
  const roleMenus = getALLRoles();
  const menuItems = roleMenus[role] || roleMenus.user;

  // Ensure setIsSidebarOpen is a function before using it
  useEffect(() => {
    // Cleanup or additional logic if needed
  }, [isMobile, setIsSidebarOpen]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;

    return menuItems.filter((item) => {
      const matchesTitle = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSubItems = item.items?.some((subItem) =>
        subItem.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesTitle || matchesSubItems;
    });
  }, [menuItems, searchQuery]);

  const toggleExpanded = (itemTitle) => {
    setExpandedItems((prev) =>
      prev.includes(itemTitle.toLowerCase())
        ? prev.filter((item) => item !== itemTitle.toLowerCase())
        : [...prev, itemTitle.toLowerCase()]
    );
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
    <motion.div
      className={cn(
        "bg-white border-r border-teal-200 flex flex-col h-full transition-all duration-300 overflow-hidden shadow-lg",
        isMobile ? "w-80" : collapsed ? "w-16" : "w-80",
        isMobile && "fixed left-0 top-0 z-50"
      )}
      initial={false}
      animate={collapsed && !isMobile ? "collapsed" : "expanded"}
      variants={{
        expanded: { width: "20rem" },
        collapsed: { width: "4rem" },
      }}
    >
      <div className="p-4 border-b border-teal-100 flex items-center justify-between bg-gradient-to-b from-white to-teal-50">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded flex items-center justify-center text-white font-bold text-sm shadow-md">
              TE
            </div>
            <div>
              <h2 className="text-lg font-bold text-teal-800 capitalize">
                {role} Portal
              </h2>
              <p className="text-xs text-teal-600">TaskEarn</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (typeof setIsSidebarOpen === "function") {
              if (isMobile) {
                setIsSidebarOpen(false);
              } else {
                setIsSidebarOpen(!collapsed);
              }
            }
          }}
          className="p-2 hover:bg-teal-100"
        >
          {isMobile ? (
            <ChevronLeft className="w-4 h-4 text-teal-600" />
          ) : collapsed ? (
            <ChevronRight className="w-4 h-4 text-teal-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-teal-600" />
          )}
        </Button>
      </div>

      {(!collapsed || isMobile) && (
        <div className="p-4 border-b border-teal-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-500" />
            <Input
              type="text"
              placeholder="Menu Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white/50"
            />
          </div>
        </div>
      )}

      {(!collapsed || isMobile) && (
        <div className="p-4 border-b border-teal-100">
          <div className="rounded-lg p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      session?.user?.image ||
                      "/placeholder.svg?height=40&width=40"
                    }
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold">
                    {session?.user?.name
                      ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="font-bold text-sm text-teal-800">
                  {session?.user?.name || "User"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 bg-teal-500 rounded-full text-white text-xs font-semibold capitalize">
                    {role}
                  </span>
                  <span className="text-xs text-teal-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 overflow-y-auto">
        {collapsed && !isMobile ? (
          <div className="space-y-2 px-2">
            {menuItems?.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-teal-600 hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:text-white"
                  )}
                  title={item.title}
                >
                  <IconComponent className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        ) : (
          <motion.ul
            className="space-y-1 p-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredMenuItems?.map((item, index) => {
              const IconComponent = item.icon;
              const isExpanded = expandedItems.includes(
                item.title.toLowerCase()
              );
              const hasSubItems = item.items && item.items.length > 0;
              const isActive = pathname === item.href;

              return (
                <motion.li key={index} variants={itemVariants}>
                  <div
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-teal-700 hover:bg-teal-500 hover:text-white cursor-pointer transition-colors duration-200 shadow-sm",
                      isExpanded && hasSubItems && "bg-teal-50 text-teal-600",
                      isActive && !hasSubItems && "bg-teal-100 text-teal-600"
                    )}
                    onClick={() => {
                      if (hasSubItems) {
                        toggleExpanded(item.title);
                      } else if (item.href) {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {hasSubItems && (
                      <ChevronLeft
                        className={cn(
                          "w-4 h-4 text-teal-600 transition-transform",
                          isExpanded ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </div>

                  {hasSubItems && isExpanded && (
                    <ul className="bg-teal-50 border-l-4 border-teal-200 ml-4 rounded-md mt-1">
                      {item.items?.map((subItem, subIndex) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <li key={subIndex}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center rounded px-8 py-2 text-sm text-teal-600 hover:text-white hover:bg-teal-500 transition-colors duration-200",
                                isSubActive && "text-white bg-teal-500"
                              )}
                            >
                              <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                              {subItem.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </nav>

      {(!collapsed || isMobile) && (
        <div className="p-4 border-t border-teal-100 mt-auto bg-gradient-to-t from-teal-50 to-white">
          <div className="text-center">
            <p className="text-xs text-teal-600">TaskEarn v1.0.0</p>
            <p className="text-[10px] text-teal-400 mt-1">
              © 2025 All Rights Reserved
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
