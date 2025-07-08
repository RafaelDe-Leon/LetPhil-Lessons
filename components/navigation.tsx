"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, BookOpen, Video } from "lucide-react"
import { LoginButton } from "@/components/login-button"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/components/auth-provider"

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Routes that are always visible
  const publicRoutes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
  ]

  // Routes that are only visible when logged in
  const protectedRoutes = [
    {
      href: "/videos",
      label: "Sessions",
      icon: Video,
      active: pathname === "/videos",
    },
    {
      href: "/categories",
      label: "Topics",
      icon: BookOpen,
      active: pathname === "/categories",
    },
    {
      href: "/coaches",
      label: "Coaches",
      icon: Users,
      active: pathname === "/coaches" || pathname.startsWith("/coaches/"),
    },
  ]

  // For logged-in users, replace Home with Sessions as the main route
  const routes = user ? protectedRoutes : publicRoutes

  return (
    <nav className="flex items-center gap-2">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {routes.map((route) => (
          <Button key={route.href} variant={route.active ? "default" : "ghost"} size="sm" asChild>
            <Link href={route.href} className="flex items-center gap-1">
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Login Button - Always visible on desktop */}
      <div className="hidden md:block ml-2">
        <LoginButton />
      </div>
    </nav>
  )
}
