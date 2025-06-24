"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import ThemeToggle from "../theme-toggle";
import { Navigation } from "./navigation";
import { LogoName } from "./logo-name";
import { useSession } from "next-auth/react";
import { WalletDisplay } from "../wallet/wallet-display";
import { UserAvatar } from "../user-avatar";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav  className="h-16 border-accent sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <Link href="/" aria-label="Home">
            <LogoName className="hidden sm:inline-flex"/>
          </Link>
        </div>
        {/* Desktop Menu */}

        <Navigation />


        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? <WalletDisplay /> : null}
          {session ? <UserAvatar /> : null}
          {!session ? (
            <Link href="/signin">
              <Button variant="outline" className="hidden sm:inline-flex">
            Sign In
          </Button>
            </Link>
          ): null}
          {/* Mobile Menu */}
          {/* <div className="md:hidden">
            <NavigationSheet />
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
