"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Wallet,
  UserCheck,
  Shield,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function AdminSidebar({ userRole, activeSection, onSectionChange }) {
  const [expandedSections, setExpandedSections] = useState(["dashboard"]);

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [
        "super_admin",
        "manager",
        "task_manager",
        "payout_manager",
        "advertiser_manager",
        "kyc_manager",
        "support_agent",
        "analyst",
      ],
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      roles: ["super_admin", "manager", "kyc_manager", "support_agent"],
      children: [
        {
          id: "users-list",
          label: "All Users",
          roles: ["super_admin", "manager", "support_agent"],
        },
        {
          id: "users-kyc",
          label: "KYC Reviews",
          roles: ["super_admin", "kyc_manager"],
        },
        {
          id: "users-suspended",
          label: "Suspended Users",
          roles: ["super_admin", "manager", "kyc_manager"],
        },
      ],
    },
    {
      id: "tasks",
      label: "Task Management",
      icon: CheckCircle,
      roles: ["super_admin", "manager", "task_manager"],
      children: [
        {
          id: "tasks-review",
          label: "Review Submissions",
          roles: ["super_admin", "task_manager"],
        },
        {
          id: "tasks-campaigns",
          label: "Manage Campaigns",
          roles: ["super_admin", "manager", "task_manager"],
        },
        {
          id: "tasks-templates",
          label: "Task Templates",
          roles: ["super_admin", "manager", "task_manager"],
        },
        {
          id: "tasks-audit",
          label: "Audit System",
          roles: ["super_admin", "task_manager"],
        },
      ],
    },
    {
      id: "payouts",
      label: "Payout Management",
      icon: Wallet,
      roles: ["super_admin", "manager", "payout_manager"],
      children: [
        {
          id: "payouts-pending",
          label: "Pending Payouts",
          roles: ["super_admin", "payout_manager"],
        },
        {
          id: "payouts-history",
          label: "Payout History",
          roles: ["super_admin", "manager", "payout_manager"],
        },
        {
          id: "payouts-reconcile",
          label: "Reconciliation",
          roles: ["super_admin", "payout_manager"],
        },
      ],
    },
    {
      id: "advertisers",
      label: "Advertiser Management",
      icon: UserCheck,
      roles: ["super_admin", "manager", "advertiser_manager"],
      children: [
        {
          id: "advertisers-requests",
          label: "New Requests",
          roles: ["super_admin", "manager", "advertiser_manager"],
        },
        {
          id: "advertisers-active",
          label: "Active Advertisers",
          roles: ["super_admin", "manager", "advertiser_manager"],
        },
      ],
    },
    {
      id: "fraud",
      label: "Fraud Detection",
      icon: Shield,
      roles: ["super_admin", "manager", "kyc_manager"],
      children: [
        {
          id: "fraud-flagged",
          label: "Flagged Users",
          roles: ["super_admin", "kyc_manager"],
        },
        {
          id: "fraud-suspicious",
          label: "Suspicious Activity",
          roles: ["super_admin", "manager", "kyc_manager"],
        },
        {
          id: "fraud-devices",
          label: "Device Tracking",
          roles: ["super_admin", "kyc_manager"],
        },
      ],
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      roles: ["super_admin", "manager", "analyst"],
      children: [
        {
          id: "reports-earnings",
          label: "Earnings Report",
          roles: ["super_admin", "manager", "analyst"],
        },
        {
          id: "reports-users",
          label: "User Analytics",
          roles: ["super_admin", "analyst"],
        },
        {
          id: "reports-campaigns",
          label: "Campaign Performance",
          roles: ["super_admin", "manager", "analyst"],
        },
      ],
    },
    {
      id: "team",
      label: "Team Management",
      icon: Users,
      roles: ["super_admin"],
      children: [
        { id: "team-members", label: "Team Members", roles: ["super_admin"] },
        { id: "team-roles", label: "Role Management", roles: ["super_admin"] },
        {
          id: "team-permissions",
          label: "Permissions",
          roles: ["super_admin"],
        },
      ],
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      roles: ["super_admin", "manager"],
      children: [
        {
          id: "settings-fees",
          label: "Fee Configuration",
          roles: ["super_admin"],
        },
        {
          id: "settings-notifications",
          label: "Notifications",
          roles: ["super_admin", "manager"],
        },
        {
          id: "settings-system",
          label: "System Config",
          roles: ["super_admin"],
        },
      ],
    },
  ];

  const hasAccess = (roles) => {
    return roles.includes(userRole);
  };

  const filteredMenuItems = menuItems.filter((item) => hasAccess(item.roles));

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {userRole.replace("_", " ").toUpperCase()}
          </Badge>
          <Button variant="ghost" size="sm">
            <Bell className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={
                activeSection === item.id || activeSection.startsWith(item.id)
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
              onClick={() => {
                if (item.children) {
                  toggleSection(item.id);
                } else {
                  onSectionChange(item.id);
                }
              }}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
              {item.children && (
                <div className="ml-auto">
                  {expandedSections.includes(item.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              )}
            </Button>

            {item.children && expandedSections.includes(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children
                  .filter((child) => hasAccess(child.roles))
                  .map((child) => (
                    <Button
                      key={child.id}
                      variant={
                        activeSection === child.id ? "secondary" : "ghost"
                      }
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => onSectionChange(child.id)}
                    >
                      {child.label}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
