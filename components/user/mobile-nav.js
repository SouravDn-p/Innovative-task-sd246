"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGetKYCDataQuery } from "@/redux/api/api";
import {
  Home,
  Briefcase,
  DollarSign,
  User,
  TrendingUp,
  CheckCircle,
  Shield,
  Users,
  Settings,
  Eye,
  Activity,
  Plus,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/button";

export function MobileNav({ activeTab, onTabChange }) {
  const { data: session, status } = useSession();
  const role = session?.user?.role?.toLowerCase() || "user";

  // Fetch KYC data for user role
  const { data: kycData } = useGetKYCDataQuery(undefined, {
    skip: role !== "user",
  });

  // Hardcoded five routes per role as specified
  const simplifiedMenus = {
    user: [
      { title: "Dashboard", icon: Home, href: "/dashboard/user" },
      { title: "Tasks", icon: CheckCircle, href: "/dashboard/user/task" },
      // Conditionally show either Wallet (for KYC verified) or KYC Verification (for non-KYC verified)
      ...(role === "user"
        ? kycData?.status === "verified"
          ? [
              {
                title: "Wallet",
                icon: DollarSign,
                href: "/dashboard/user/wallet",
              },
            ]
          : [
              {
                title: "KYC",
                icon: Shield,
                href: "/dashboard/user/kyc-verification",
              },
            ]
        : []),
      // Conditionally show either "Completed" (for KYC verified) or nothing (for non-KYC verified)
      ...(role === "user" && kycData?.status === "verified"
        ? [
            {
              title: "Completed",
              icon: CheckCircle,
              href: "/dashboard/user/task/completed",
            },
          ]
        : []),
      { title: "Referrals", icon: Users, href: "/dashboard/user/referrals" },
    ],
    advertiser: [
      { title: "Dashboard", icon: Home, href: "/dashboard/advertiser" },
      {
        title: "Create",
        icon: Plus,
        href: "/dashboard/advertiser/create-task",
      },
      {
        title: "Tasks",
        icon: CheckCircle,
        items: [
          {
            name: "Active",
            href: "/dashboard/advertiser/active-tasks",
          },
          {
            name: "History",
            href: "/dashboard/advertiser/task-history",
          },
        ],
      },
      {
        title: "Profile",
        icon: User,
        href: "/dashboard/advertiser/profile",
      },
      {
        title: "Wallet",
        icon: DollarSign,
        href: "/dashboard/advertiser/wallet",
      },
      {
        title: "Analytics",
        icon: BarChart3,
        href: "/dashboard/advertiser/analytics",
      },
    ],
    admin: [
      { title: "Dashboard", icon: Home, href: "/dashboard/admin" },
      { title: "Tasks", icon: CheckCircle, href: "/dashboard/admin/tasks" },
      { title: "KYC", icon: Shield, href: "/dashboard/admin/kyc-management" },
      {
        title: "Submissions",
        icon: Eye,
        href: "/dashboard/admin/tasks-submissions",
      },
      { title: "Users", icon: User, href: "/dashboard/admin/users" },
    ],
  };

  const navItems = simplifiedMenus[role] || simplifiedMenus.user;

  // Map to flattened items with id, label, icon, href
  const flattenedNavItems = navItems
    .filter((item) => item.href) // Only include items that have href
    .map((item) => ({
      id: item.title.toLowerCase().replace(/\s+/g, "-"),
      label: item.title,
      icon: item.icon,
      href: item.href,
    }));

  if (status === "loading") {
    return null; // Avoid rendering until session is loaded
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50 w-full max-w-full">
      <div className="flex justify-around w-full max-w-full">
        {flattenedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href || "#"}
              onClick={() => onTabChange(item.id)}
              className="flex-1 min-w-0"
            >
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 h-auto py-2 px-1 w-full ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs truncate">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
