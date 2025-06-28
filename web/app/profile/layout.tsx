"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Image, Settings } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";

const sidebarItems = [
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/profile/faces",
    label: "Face Management",
    icon: Image,
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-muted/30 border-r">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Menu</h2>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}