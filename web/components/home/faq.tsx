import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { PlusIcon } from "lucide-react";

const faq = [
  {
    question: "How does the virtual try-on technology work?",
    answer:
      "Face Me uses advanced AI to map your facial features and realistically apply virtual accessories, makeup, and styling elements. Simply upload your photo or use our camera feature to see how different items look on you.",
  },
  {
    question: "What types of items can I try on virtually?",
    answer:
      "You can try on eyeglasses, sunglasses, hats, earrings, lipstick, makeup looks, and various fashion accessories. We're constantly adding new categories and products to our virtual try-on library.",
  },
  {
    question: "How do credits work in Face Me?",
    answer:
      "Credits are used to generate AI-styled faces, view larger images, and access premium features. You earn credits when others view and like your creations, and you can purchase additional credits through our packages.",
  },
  {
    question: "Can I monetize my face styles?",
    answer:
      "Yes! When other users view and interact with your styled faces, you earn credits. Popular creators can build a following and earn substantial credits from their creative content.",
  },
  {
    question: "Is my face data secure and private?",
    answer:
      "Absolutely. We take privacy seriously. Your face data is encrypted, never shared with third parties, and you have full control over what you share publicly. You can delete your data anytime.",
  },
  {
    question: "Can I shop for the items I try on?",
    answer:
      "Yes! Our integrated shop lets you purchase the actual products you've tried on virtually. We partner with trusted retailers to ensure you get authentic items that match your virtual try-on experience.",
  },
];

const FAQ = () => {
  return (
    <div id="faq" className="w-full max-w-screen-xl mx-auto py-8 xs:py-16 px-6">
      <h2 className="md:text-center text-3xl xs:text-4xl md:text-5xl !leading-[1.15] font-bold tracking-tighter">
        Frequently Asked Questions
      </h2>
      <p className="mt-1.5 md:text-center xs:text-lg text-muted-foreground">
        Everything you need to know about Face Me's virtual styling platform.
      </p>

      <div className="min-h-[550px] md:min-h-[320px] xl:min-h-[300px]">
        <Accordion
          type="single"
          collapsible
          className="mt-8 space-y-4 md:columns-2 gap-4"
        >
          {faq.map(({ question, answer }, index) => (
            <AccordionItem
              key={question}
              value={`question-${index}`}
              className="bg-accent py-1 px-4 rounded-xl border-none !mt-0 !mb-4 break-inside-avoid"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                  className={cn(
                    "flex flex-1 items-center justify-between py-4 font-semibold tracking-tight transition-all hover:underline [&[data-state=open]>svg]:rotate-45",
                    "text-start text-lg"
                  )}
                >
                  {question}
                  <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionContent className="text-[15px]">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
