import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CircleCheck, Sparkles, Crown, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Explorer",
    price: 5,
    credits: 100,
    description:
      "Perfect for trying out Face Me and creating your first styled looks.",
    features: [
      "100 credits included",
      "Basic face styling",
      "Community gallery access",
      "Standard expressions & styles",
      "Mobile & desktop access",
    ],
    buttonText: "Start Exploring",
    icon: Sparkles,
  },
  {
    name: "Creator",
    price: 15,
    credits: 350,
    description:
      "Ideal for active users who love creating and sharing face styles regularly.",
    features: [
      "350 credits included",
      "Advanced styling options",
      "Premium expressions & themes",
      "Priority community features",
      "Style analytics dashboard",
    ],
    buttonText: "Become a Creator",
    isRecommended: true,
    isPopular: true,
    icon: Crown,
  },
  {
    name: "Influencer",
    price: 30,
    credits: 750,
    description:
      "For power users and style influencers who want unlimited creative freedom.",
    features: [
      "750 credits included",
      "All premium features",
      "Exclusive styling tools",
      "Monetization opportunities",
      "Priority customer support",
    ],
    buttonText: "Go Influencer",
    icon: Zap,
  },
];

const Pricing = () => {
  return (
    <div id="pricing" className="max-w-screen-lg mx-auto py-12 xs:py-20 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl xs:text-5xl font-bold tracking-tight">
          Choose Your Style Journey
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Start your virtual styling adventure with credits that let you create,
          share, and monetize your unique face styles.
        </p>
      </div>
      <div className="mt-8 xs:mt-14 grid grid-cols-1 lg:grid-cols-3 items-center gap-8 lg:gap-0">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative bg-accent/50 border p-7 rounded-xl lg:rounded-none lg:first:rounded-l-xl lg:last:rounded-r-xl",
                {
                  "bg-background border-[2px] border-primary py-12 !rounded-xl":
                    plan.isPopular,
                }
              )}
            >
              {plan.isPopular && (
                <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                  Most Popular
                </Badge>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">{plan.name}</h3>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold">${plan.price}</p>
                <p className="text-sm text-primary font-medium">
                  {plan.credits} credits included
                </p>
              </div>
              <p className="mt-4 font-medium text-muted-foreground">
                {plan.description}
              </p>
              <Separator className="my-6" />
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CircleCheck className="h-4 w-4 mt-1 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/wallet">
                <Button
                  variant={plan.isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full mt-6 rounded-full"
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include access to our community gallery, basic styling
          tools, and mobile app.
          <Link href="/faces" className="text-primary hover:underline ml-1">
            Explore the gallery →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Pricing;
