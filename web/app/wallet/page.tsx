"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ListTodo, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import { WalletDisplay } from "@/components/wallet/wallet-display";
import { PaymentPackages } from "@/components/wallet/payment-packages";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { UserAvatar } from "@/components/user-avatar";
import { Navigation } from "@/components/navigation";

export default function WalletPage() {
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            <span className="font-semibold">Todo App - Wallet</span>
          </div>
          
          <Navigation />

          <div className="flex items-center gap-4">
            <WalletDisplay />
            <UserAvatar />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8 space-y-8">
        <PaymentPackages />
        <TransactionHistory />
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