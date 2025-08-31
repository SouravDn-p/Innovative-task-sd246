"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Home,
  Briefcase,
  DollarSign,
  HomeIcon,
  User,
  TrendingUp,
  CheckCircle,
  Shield,
} from "lucide-react";
import { Button } from "../ui/button";

export function MobileNav({ activeTab, onTabChange }) {
  const { data: session, status } = useSession();
  const role = session?.user?.role?.toLowerCase() || "user";

  // Hardcoded five routes per role, including Home and excluding Settings
  const simplifiedMenus = {
    user: [
      { title: "Dashboard", icon: Home, href: "/dashboard/user" },
      { title: "Tasks", icon: CheckCircle, href: "/dashboard/user/task" },
      { title: "Wallet", icon: DollarSign, href: "/dashboard/user/wallet" },
      { title: "Profile", icon: User, href: "/dashboard/user/profile" },
      { title: "Home", icon: HomeIcon, href: "/" },
    ],
    advertiser: [
      { title: "Dashboard", icon: Home, href: "/dashboard/advertiser" },
      {
        title: "Create",
        icon: CheckCircle,
        href: "/dashboard/advertiser/create-task",
      },
      {
        title: "Wallet",
        icon: DollarSign,
        href: "/dashboard/advertiser/wallet",
      },
      {
        title: "Analytics",
        icon: TrendingUp,
        href: "/dashboard/advertiser/analytics",
      },
      { title: "Home", icon: HomeIcon, href: "/" },
    ],
    admin: [
      { title: "Dashboard", icon: Home, href: "/dashboard/admin" },
      { title: "Tasks", icon: CheckCircle, href: "/dashboard/admin/tasks" },
      { title: "KYC", icon: Shield, href: "/dashboard/admin/kyc-management" },
      { title: "Payouts", icon: DollarSign, href: "/dashboard/admin/payouts" },
      { title: "Users", icon: User, href: "/dashboard/admin/users" },
    ],
  };

  const navItems = simplifiedMenus[role] || simplifiedMenus.user;

  // Map to flattened items with id, label, icon, href
  const flattenedNavItems = navItems.map((item) => ({
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
              href={item.href}
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
