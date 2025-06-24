import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/home/footer";

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 items-center justify-center py-12">
        <AuthForm mode="signup" />
      </div>
      <div className="flex flex-1 items-center justify-center ">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
      <Footer />
    </>
  );
}
