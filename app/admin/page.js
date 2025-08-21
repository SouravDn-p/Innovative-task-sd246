"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { UserManagement } from "@/components/admin/user-management";
import { TaskManagement } from "@/components/admin/task-management";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    console.log("Session status:", status);
    console.log("role:", session?.user?.role);
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      // Redirect non-admin users to their appropriate dashboard
      router.push("/user");
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  const userRole = session?.user?.role || "admin";

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard userRole={userRole} />;
      case "users-list":
      case "users-kyc":
      case "users-suspended":
        return <UserManagement userRole={userRole} section={activeSection} />;
      case "tasks-review":
      case "tasks-campaigns":
      case "tasks-audit":
        return <TaskManagement userRole={userRole} section={activeSection} />;
      default:
        return <AdminDashboard userRole={userRole} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        userRole={userRole}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold capitalize">
            {activeSection.replace("-", " ").replace("_", " ")}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
