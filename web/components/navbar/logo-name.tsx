import { cn } from "@/lib/utils";

export const LogoName = ({ className }: { className?: string }) => (
  <div className={cn("text-xl font-bold", className)}>
    <span className="text-primary">Muk</span>
    <span className="text-muted-foreground">ha</span>
  </div>
);
