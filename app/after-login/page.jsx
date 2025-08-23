"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const getDashboardRoute = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "advertiser") return "/dashboard/advertiser";
  return "/dashboard/user";
};

export default function AfterLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user)?.role || "user";
      router.replace(getDashboardRoute(role));
    }
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Preparing your dashboard…</div>
    </div>
  );
}
