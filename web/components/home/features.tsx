import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Glasses,
  Palette,
  Users,
  Sparkles,
  ShoppingBag,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Glasses,
    title: "Virtual Try-On",
    description:
      "See how eyeglasses, hats, and accessories look on your real face using advanced AI technology.",
  },
  {
    icon: Palette,
    title: "Beauty Styling",
    description:
      "Try different lipstick shades, makeup looks, and beauty products virtually before purchasing.",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Looks",
    description:
      "Create stunning, personalized face styles with different expressions, themes, and accessories.",
  },
  {
    icon: Users,
    title: "Community Gallery",
    description:
      "Share your styled looks with the community, get likes, and discover trending face styles.",
  },
  {
    icon: ShoppingBag,
    title: "Shop with Confidence",
    description:
      "Purchase fashion and beauty items knowing exactly how they'll look on you before you buy.",
  },
  {
    icon: Heart,
    title: "Monetize Your Style",
    description:
      "Earn credits when others view and like your face creations, turning your style into rewards.",
  },
];

const Features = () => {
  return (
    <div
      id="features"
      className="max-w-screen-xl mx-auto w-full py-12 xs:py-20 px-6"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-bold tracking-tight">
          The Story Behind Mukha
        </h2>
        <div className="mt-6 max-w-4xl mx-auto space-y-4 text-lg text-muted-foreground">
          <p>
            The inspiration for{" "}
            <strong className="text-foreground">Mukha</strong> came from a
            simple but common problem:
          </p>
          <p>
            When shopping online, especially for fashion and beauty items,
            there&apos;s no easy way to
            <em className="text-foreground">
              {" "}
              see how you&apos;d actually look
            </em>{" "}
            wearing them before you buy.
          </p>
          <p>
            Whether it&apos;s{" "}
            <strong className="text-primary">eyeglasses</strong>,{" "}
            <strong className="text-primary">lipstick</strong>,
            <strong className="text-primary"> hats</strong>, or{" "}
            <strong className="text-primary">earrings</strong>, it felt like a
            guessing game. So I thought —{" "}
            <em className="text-foreground">
              what if an app could let you try them on virtually using your real
              face, and even let others enjoy and engage with your styled looks?
            </em>
          </p>
          <p>
            That&apos;s how the idea of{" "}
            <strong className="text-primary">Mukha</strong> was born — an
            AI-powered face styling and monetization app.
          </p>
        </div>
      </div>

      <div className="mt-8 xs:mt-14 w-full mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col border rounded-xl overflow-hidden shadow-none hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="!mt-3 text-xl font-bold tracking-tight">
                {feature.title}
              </h4>
              <p className="mt-1 text-muted-foreground text-sm xs:text-[17px]">
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className="mt-auto px-0 pb-0">
              <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 h-52 ml-6 rounded-tl-xl flex items-center justify-center">
                <feature.icon className="h-16 w-16 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
