import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-accent">
      {/* Bolt Badge - Absolute positioned top right */}
      <div className="absolute top-20 right-4 z-10">
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:scale-105 transition-transform duration-200"
        >
          <Image
            src="https://ixi2mx3eecfmyfha.public.blob.vercel-storage.com/black_circle_360x360-WyJ6u7yEcKF8GijdGB6yyiQIeVrEn8.png"
            alt="Bolt Hackathon Badge"
            width={100}
            height={100}
            className="rounded-full shadow-lg"
          />
        </a>
      </div>
      <div className="max-w-screen-xl w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
        <div className="max-w-xl">
          <Badge className="rounded-full py-1 border-none">
            AI-Powered Virtual Try-On
          </Badge>
          <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold !leading-[1.2] tracking-tight">
            Try Before You Buy with <span className="text-primary">Mukha</span>
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg">
            See how you&apos;d actually look wearing eyeglasses, lipstick, hats,
            or earrings before you buy. Create stunning AI-generated looks,
            share them with the community, and even monetize your style.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/faces">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full text-base"
              >
                Explore Faces <ArrowUpRight className="!h-5 !w-5" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full text-base shadow-none"
              >
                <CirclePlay className="!h-5 !w-5" /> Try Virtual Styling
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative lg:max-w-lg xl:max-w-xl w-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl aspect-square flex items-center justify-center">
          <Image
            src="https://ixi2mx3eecfmyfha.public.blob.vercel-storage.com/a6024699-47fc-4fe8-9c2c-024e0faa3d07-6wydTXsojBfK2tMTsn0aaSmvSsxAPe.png"
            alt="Face Me"
            width={500}
            height={500}
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
