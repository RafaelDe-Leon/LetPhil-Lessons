"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Home, Users, BookOpen, Video, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoginButton } from "@/components/login-button"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Always show Home button
  const homeRoute = {
    href: "/",
    label: "Home",
    icon: Home,
    active: pathname === "/",
  }

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

  // Always include Home, add protected routes if user is logged in
  const routes = [homeRoute, ...(user ? protectedRoutes : [])]

  const toggleMenu = () => {
    setOpen(!open)
  }

  const closeMenu = () => {
    setOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Menu Overlay - Solid black background */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Panel - Completely solid background */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-80 
          transform transition-transform duration-300 ease-in-out md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
          shadow-2xl border-r border-slate-200 dark:border-slate-800
        `}
        style={{
          backgroundColor: "#ffffff",
        }}
      >
        {/* Dark mode override */}
        <div className="hidden dark:block absolute inset-0" style={{ backgroundColor: "#020617" }} />

        <div className="relative flex flex-col h-full z-10">
          {/* Header - Solid background */}
          <div
            className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800"
            style={{ backgroundColor: "inherit" }}
          >
            <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-2 text-white dark:from-slate-700 dark:to-slate-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">LetPhil</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Learning Hub</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu" className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links - Solid background */}
          <nav className="flex-1 p-6" style={{ backgroundColor: "inherit" }}>
            <div className="space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={closeMenu}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium 
                    transition-colors duration-200
                    ${
                      route.active
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Login Section - Solid background */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800" style={{ backgroundColor: "inherit" }}>
            <div onClick={closeMenu} className="w-full">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
