import {
  Home,
  User,
  CheckCircle,
  Settings,
  BarChart3,
  Users,
  Building2,
  IndianRupee,
  CreditCard,
  HomeIcon,
  TrendingUp,
  Shield,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";

export default function getALLRoles() {
  const roleMenus = {
    user: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        title: "Tasks",
        icon: CheckCircle,
        href: "/dashboard/user/task",
      },
      {
        title: "Referrals",
        icon: Users,
        href: "/dashboard/user/referrals",
      },
      {
        title: "Wallet",
        icon: IndianRupee,
        href: "/dashboard/user/wallet",
      },
      {
        title: "Profile",
        icon: User,
        href: "/dashboard/user/profile",
      },
      {
        title: "KYC Verification",
        icon: Shield,
        href: "/dashboard/user/kyc-verification",
      },
      {
        title: "Become an Advertiser",
        icon: Building2,
        href: "/dashboard/user/become-an-advertiser",
      },
      // {
      //   title: "Settings",
      //   icon: Settings,
      //   href: "/dashboard/user/settings",
      // },
      {
        title: "Home",
        icon: HomeIcon,
        href: "/",
      },
    ],
    advertiser: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/advertiser",
      },
      {
        title: "Tasks",
        icon: CheckCircle,
        items: [
          {
            name: "Active Tasks",
            href: "/dashboard/advertiser/active-tasks",
          },
          {
            name: "Create Tasks",
            href: "/dashboard/advertiser/create-task",
          },
          {
            name: "Tasks History",
            href: "/dashboard/advertiser/task-history",
          },
        ],
      },
      {
        title: "Analytics",
        icon: TrendingUp,
        href: "/dashboard/advertiser/analytics",
      },
      {
        title: "Profile",
        icon: User,
        href: "/dashboard/advertiser/profile",
      },
      {
        title: "Wallet",
        icon: IndianRupee,
        href: "/dashboard/advertiser/wallet",
      },
      // {
      //   title: "Settings",
      //   icon: Settings,
      //   href: "/dashboard/advertiser/settings",
      // },
      {
        title: "Home",
        icon: HomeIcon,
        href: "/",
      },
    ],
    admin: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/admin",
      },
      {
        title: "Users",
        icon: Users,
        href: "/dashboard/admin/users",
      },
      {
        title: "Tasks",
        icon: CheckCircle,
        href: "/dashboard/admin/tasks",
      },
      {
        title: "Tasks",
        icon: ListChecks,
        href: "/dashboard/admin/tasks-submissions",
      },
      {
        title: "KYC Management",
        icon: Shield,
        href: "/dashboard/admin/kyc-management",
      },
      {
        title: "Advertisers",
        icon: Building2,
        href: "/dashboard/admin/advertisers",
      },
      {
        title: "Payouts",
        icon: CreditCard,
        href: "/dashboard/admin/payouts",
      },
      {
        title: "Reports",
        icon: BarChart3,
        href: "/dashboard/admin/reports",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/admin/settings",
      },
      {
        title: "Home",
        icon: HomeIcon,
        href: "/",
      },
    ],
  };
  return roleMenus;
}
