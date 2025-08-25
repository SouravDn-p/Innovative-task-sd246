import {
  Home,
  User,
  Briefcase,
  FileText,
  Settings,
  BarChart3,
  Users,
  Building2,
  Package,
  MessageSquare,
  Award,
  Calendar,
  DollarSign,
  CreditCard,
  HomeIcon,
  WalletCards,
  TrendingUp,
  Target,
  Zap,
  Star,
} from "lucide-react";

export default function getALLRoles() {
  const roleMenus = {
    user: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/",
      },
      {
        title: "Tasks",
        icon: Briefcase,
        href: "/dashboard/user/tasks",
      },
      {
        title: "Referrals",
        icon: Users,
        href: "/dashboard/user/referrals",
      },
      {
        title: "Wallet",
        icon: DollarSign,
        href: "/dashboard/user/wallet",
      },
      {
        title: "Profile",
        icon: User,
        href: "/dashboard/user/profile",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/user/settings",
      },
      {
        title: "Home",
        icon: HomeIcon,
        href: "/",
      },
    ],
    advertiser: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/dashboard/advertiser",
      },
      {
        title: "Campaigns",
        icon: BarChart3,
        items: [
          {
            name: "Active Campaigns",
            href: "/dashboard/advertiser/campaigns/active",
          },
          {
            name: "Create Campaign",
            href: "/dashboard/advertiser/campaigns/create",
          },
          {
            name: "Campaign History",
            href: "/dashboard/advertiser/campaigns/history",
          },
        ],
      },
      {
        title: "Analytics",
        icon: TrendingUp,
        href: "/dashboard/advertiser/analytics",
      },
      {
        title: "Wallet",
        icon: DollarSign,
        href: "/dashboard/advertiser/wallet",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/advertiser/settings",
      },
      {
        title: "Home",
        icon: HomeIcon,
        href: "/",
      },
    ],
    admin: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/dashboard/admin",
      },
      {
        title: "Users",
        icon: Users,
        href: "/dashboard/admin/users",
      },
      {
        title: "Tasks",
        icon: Briefcase,
        href: "/dashboard/admin/tasks",
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
    ],
  };
  return roleMenus;
}
