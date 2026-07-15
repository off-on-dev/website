import type { JSX, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

export const Abbr = ({ title, children }: AbbrProps): JSX.Element => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <abbr title={title} className="cursor-help underline decoration-dotted decoration-1 underline-offset-2">
          {children}
        </abbr>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
