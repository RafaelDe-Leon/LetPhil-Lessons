"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Home, Users, BookOpen } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/categories",
      label: "Categories",
      icon: BookOpen,
      active: pathname === "/categories",
    },
    {
      href: "/teachers",
      label: "Teachers",
      icon: Users,
      active: pathname === "/teachers" || pathname.startsWith("/teachers/"),
    },
  ]

  return (
    <nav className="flex items-center gap-2">
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

      {/* Mobile navigation */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {routes.map((route) => (
            <DropdownMenuItem key={route.href} asChild>
              <Link href={route.href} className="flex items-center gap-2">
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
