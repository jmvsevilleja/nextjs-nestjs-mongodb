import { Separator } from "@/components/ui/separator";
import {
  DribbbleIcon,
  GithubIcon,
  TwitchIcon,
  TwitterIcon,
} from "lucide-react";
import Link from "next/link";

const footerSections = [
  {
    title: "Platform",
    links: [
      {
        title: "Virtual Try-On",
        href: "/shop",
      },
      {
        title: "Face Gallery",
        href: "/faces",
      },
      {
        title: "Style Community",
        href: "/people",
      },
      {
        title: "Create Looks",
        href: "/profile/faces/create",
      },
      {
        title: "Pricing",
        href: "#pricing",
      },
      {
        title: "Features",
        href: "#features",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        title: "About Mukha",
        href: "#",
      },
      {
        title: "Our Story",
        href: "#features",
      },
      {
        title: "Careers",
        href: "#",
      },
      {
        title: "Press Kit",
        href: "#",
      },
      {
        title: "Brand Assets",
        href: "#",
      },
      {
        title: "Contact Us",
        href: "#",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        title: "Style Blog",
        href: "#",
      },
      {
        title: "Fashion Trends",
        href: "#",
      },
      {
        title: "Try-On Tips",
        href: "#",
      },
      {
        title: "Help Center",
        href: "#",
      },
      {
        title: "API Docs",
        href: "#",
      },
      {
        title: "Support",
        href: "#",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        title: "Discord",
        href: "#",
      },
      {
        title: "Twitter",
        href: "#",
      },
      {
        title: "Instagram",
        href: "#",
      },
      {
        title: "TikTok",
        href: "#",
      },
      {
        title: "YouTube",
        href: "#",
      },
      {
        title: "Reddit",
        href: "#",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        title: "Privacy Policy",
        href: "#",
      },
      {
        title: "Terms of Service",
        href: "#",
      },
      {
        title: "Cookie Policy",
        href: "#",
      },
      {
        title: "AI Ethics",
        href: "#",
      },
      {
        title: "Data Security",
        href: "#",
      },
      {
        title: "GDPR",
        href: "#",
      },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="mt-12 xs:mt-20 bg-background border-t">
      <div className="max-w-screen-xl mx-auto py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-8 gap-y-10 px-6">
        <div className="col-span-full xl:col-span-2">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                M
              </span>
            </div>
            <div className="text-xl font-bold">
              <span className="text-primary">Muk</span>
              <span className="text-muted-foreground">ha</span>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground">
            AI-powered virtual try-on platform that lets you see how fashion and
            beauty items look on your real face before you buy. Create, share,
            and monetize your style.
          </p>
        </div>

        {footerSections.map(({ title, links }) => (
          <div key={title} className="xl:justify-self-end">
            <h6 className="font-semibold text-foreground">{title}</h6>
            <ul className="mt-6 space-y-4">
              {links.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />
      <div className="max-w-screen-xl mx-auto py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6">
        {/* Copyright */}
        <span className="text-muted-foreground text-center xs:text-start">
          &copy; {new Date().getFullYear()}{" "}
          <Link href="/" className="text-primary hover:underline">
            Mukha
          </Link>
          . All rights reserved. Powered by AI.
        </span>

        <div className="flex items-center gap-5 text-muted-foreground">
          <Link
            href="#"
            target="_blank"
            className="hover:text-primary transition-colors"
          >
            <TwitterIcon className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            target="_blank"
            className="hover:text-primary transition-colors"
          >
            <DribbbleIcon className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            target="_blank"
            className="hover:text-primary transition-colors"
          >
            <TwitchIcon className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            target="_blank"
            className="hover:text-primary transition-colors"
          >
            <GithubIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
