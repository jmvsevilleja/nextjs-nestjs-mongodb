"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PaymentPackages } from "@/components/wallet/payment-packages";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";

export default function WalletPage() {
  const { status } = useSession();
  const router = useRouter();

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

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex-1 py-8 space-y-8">
        <PaymentPackages />
        <TransactionHistory />
      </div>
      <Footer />
    </>
  );
}
