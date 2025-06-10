"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ListTodo, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import { TodoContainer } from "@/components/todo/todo-container";
import { WalletDisplay } from "@/components/wallet/wallet-display";
import { UserAvatar } from "@/components/user-avatar";
import { MainHeader } from "@/components/layout/main-header";
import { Main } from "next/document";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />

      <main className="container flex-1 py-8">
        <TodoContainer />
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} Todo App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
