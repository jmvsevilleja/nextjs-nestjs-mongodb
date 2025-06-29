"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, Package, Users, CreditCard, FolderTree } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: BarChart3,
    value: "dashboard",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    value: "products",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    value: "categories",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    value: "users",
  },
  {
    href: "/admin/transactions",
    label: "Transactions",
    icon: CreditCard,
    value: "transactions",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
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
    router.push("/admin/login");
    return null;
  }

  // Check if user is admin (this should be validated on the backend)
  if (session?.user?.email !== "admin@example.com") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Determine current tab value based on pathname
  const getCurrentTab = () => {
    if (pathname === "/admin") return "dashboard";
    if (pathname === "/admin/products") return "products";
    if (pathname === "/admin/categories") return "categories";
    if (pathname === "/admin/users") return "users";
    if (pathname === "/admin/transactions") return "transactions";
    return "dashboard";
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex-1 py-8 space-y-8">
        {/* Admin Navigation Tabs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage products, categories, users, and system settings
            </p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={getCurrentTab()} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {adminItems.map((item) => {
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