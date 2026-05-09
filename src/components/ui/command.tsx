import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";

export const Command = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    data-slot="command"
    className={cn("flex flex-col", className)}
    {...props}
  />
);

export const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    data-slot="command-input"
    className={cn(
      "flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] text-neutral-200 placeholder:text-neutral-500",
      className,
    )}
    {...props}
  />
));

export const CommandList = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    data-slot="command-list"
    className={cn("overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
);

export const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty
    data-slot="command-empty"
    className={cn("py-6 text-center text-[12px] text-neutral-500", className)}
    {...props}
  />
);

export const CommandItem = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    data-slot="command-item"
    className={cn(
      "cursor-pointer rounded-xl bg-transparent hover:bg-white/[0.06] data-[selected=true]:bg-white/[0.06]",
      className,
    )}
    {...props}
  />
);
