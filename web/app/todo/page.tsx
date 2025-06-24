"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TodoContainer } from "@/components/todo/todo-container";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";

export default function DashboardPage() {
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
        <TodoContainer />
      </div>
      <Footer />
    </>
  );
}
