"use client";

import { usePathname } from "next/navigation";
import Plasma from "@/components/plasma";

// Define paths where plasma should be shown
const plasmaPaths = ["/", "/login", "/register", "/about"];

export default function PlasmaBackground() {
  const pathname = usePathname();

  // Only show plasma on specific paths
  if (!plasmaPaths.includes(pathname)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Plasma
        color="#8b5cf6"
        speed={0.8}
        direction="forward"
        scale={1.5}
        opacity={0.4}
        mouseInteractive={true}
      />
    </div>
  );
}
