"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Info, ListTodo, LogIn, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";

// Inline CSS for standalone component
const styles = `
.liquid-glass-header {
  background: oklch(0.15 0.04 280 / 0.45);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid oklch(0.35 0.08 280 / 0.25);
  box-shadow: 0 2px 12px oklch(0 0 0 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.08);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-animation {
  animation: fadeIn 0.3s ease-out;
}
`;

export function Header() {
  const { data: session } = useSession();
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard/user/task", label: "Tasks", icon: ListTodo },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <>
      <style>{styles}</style>
      <header className="sticky top-0 z-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex h-14 items-center justify-between px-6 liquid-glass-header rounded-full header-animation">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-semibold tracking-wide text-white">
                EarnTask
              </span>
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden items-center gap-6 text-sm text-gray-300 md:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-blue-400 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {session ? (
                <Button
                  variant="outline"
                  className="rounded-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-full bg-blue-500 px-6 text-white hover:bg-blue-600"
                  >
                    <Link href="/register">Create Account</Link>
                  </Button>
                </>
              )}
            </div>
            {/* Mobile Nav */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-700 bg-gray-900/80 text-gray-200 hover:bg-gray-800"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="liquid-glass-header border-gray-800 p-0 w-64 flex flex-col"
                >
                  {/* Brand Header */}
                  <div className="flex items-center gap-1.5 px-4 py-4 border-b border-gray-800">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">E</span>
                    </div>
                    <span className="font-semibold tracking-wide text-white text-lg">
                      EarnTask
                    </span>
                  </div>
                  {/* Nav Links */}
                  <nav className="flex flex-col gap-1 mt-2 text-gray-200">
                    {links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900 hover:text-blue-400 transition-colors"
                      >
                        <span className="inline-flex items-center justify-center w-5 h-5 text-gray-400">
                          <l.icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm">{l.label}</span>
                      </Link>
                    ))}
                    {!session && (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900 hover:text-blue-400 transition-colors"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 text-gray-400">
                            <LogIn className="h-4 w-4" />
                          </span>
                          <span className="text-sm">Login</span>
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900 hover:text-blue-400 transition-colors"
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 text-gray-400">
                            <UserPlus className="h-4 w-4" />
                          </span>
                          <span className="text-sm">Register</span>
                        </Link>
                      </>
                    )}
                  </nav>
                  {/* CTA Button at Bottom */}
                  <div className="mt-auto border-t border-gray-800 p-4">
                    {session ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                      >
                        Dashboard
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="w-full rounded-full bg-blue-500 px-6 text-white hover:bg-blue-600"
                      >
                        <Link href="/register">Create Account</Link>
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
