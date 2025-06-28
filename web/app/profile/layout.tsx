"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Image, Settings } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sidebarItems = [
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    value: "profile",
  },
  {
    href: "/profile/faces",
    label: "Face Management",
    icon: Image,
    value: "faces",
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: Settings,
    value: "settings",
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

  // Determine current tab value based on pathname
  const getCurrentTab = () => {
    if (pathname === "/profile") return "profile";
    if (pathname === "/profile/faces") return "faces";
    if (pathname === "/profile/settings") return "settings";
    return "profile";
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex-1 py-8 space-y-8">
        {/* Profile Navigation Tabs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account, faces, and settings
            </p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={getCurrentTab()} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}