"use client";

import { useSelector } from "react-redux";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobiles";
import DashboardSidebar from "./dashboard-sidebar";
import DashboardHeader from "./dashboard-header";
import { MobileNav } from "@/components/user/mobile-nav";
import ReduxProvider from "@/components/ReduxProvider";
import SessionWrapper from "@/components/SessionWrapper";

function DashboardContent({ children }) {
  const role = useSelector((state) => state?.auth?.role) || "user";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DashboardSidebar
          role={role}
          collapsed={!isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header for both mobile and desktop */}
        <DashboardHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={`${isMobile ? "p-4 pb-20" : "p-6"} min-h-full`}>
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Mobile Sidebar */}
          <div className="fixed left-0 top-0 h-full z-50 w-80 transform transition-transform duration-300 ease-in-out">
            <DashboardSidebar
              role={role}
              collapsed={false}
              setIsSidebarOpen={setIsSidebarOpen}
              isMobile={true}
            />
          </div>
        </>
      )}
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
