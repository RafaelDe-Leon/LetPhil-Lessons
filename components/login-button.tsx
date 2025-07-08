"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogIn, LogOut, LayoutDashboard, User } from "lucide-react"
import Link from "next/link"
import { SimpleDropdown, SimpleDropdownItem } from "@/components/simple-dropdown"

export function LoginButton() {
  const { user, isAdmin, signOut } = useAuth()

  if (!user) {
    return (
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <Link href="/auth">
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Link>
      </Button>
    )
  }

  return (
    <SimpleDropdown
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      }
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{user.displayName || "User"}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>

      <SimpleDropdownItem>
        <Link href="/profile" className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Link>
      </SimpleDropdownItem>

      {isAdmin && (
        <SimpleDropdownItem>
          <Link href="/admin" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </SimpleDropdownItem>
      )}

      <SimpleDropdownItem onClick={signOut}>
        <div className="flex items-center text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </div>
      </SimpleDropdownItem>
    </SimpleDropdown>
  )
}
