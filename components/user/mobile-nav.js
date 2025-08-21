"use client"
import { Button } from "@/components/ui/button"
import { Home, CheckCircle, Users, Wallet, User } from "lucide-react"

export function MobileNav({ activeTab, onTabChange }) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckCircle },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col gap-1 h-auto py-2 px-3 ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
