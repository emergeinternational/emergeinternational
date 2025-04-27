
import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
}

export function Code({ className, children, ...props }: CodeProps) {
  return (
    <pre 
      className={cn("p-4 rounded bg-gray-100 overflow-auto text-sm", className)} 
      {...props}
    >
      {children}
    </pre>
  );
}
