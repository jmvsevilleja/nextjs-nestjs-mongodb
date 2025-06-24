import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/home/footer";

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 items-center justify-center py-12">
        <AuthForm mode="signin" />
      </div>
      <div className="flex flex-1 items-center justify-center ">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
      <Footer />
    </>
  );
}
