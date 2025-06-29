"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, User, Wallet, Users, ShoppingBag, UserCheck } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/faces",
      label: "Faces",
      icon: Users,
    },
    {
      href: "/people",
      label: "People",
      icon: UserCheck,
    },
    {
      href: "/shop",
      label: "Shop",
      icon: ShoppingBag,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: Wallet,
    },
  ];

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href === "/people" && pathname.startsWith("/people")) ||
          (item.href === "/shop" && pathname.startsWith("/shop"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}