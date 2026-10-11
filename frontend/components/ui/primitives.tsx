"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, Inbox, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-background hover:bg-accent-hover",
        secondary:
          "border border-surface-border bg-surface-elevated text-content-primary hover:bg-surface",
        ghost: "text-content-secondary hover:bg-surface-elevated hover:text-content-primary",
        danger: "bg-status-danger/15 text-status-danger hover:bg-status-danger/25",
      },
      size: { default: "px-4 py-2.5 min-h-11", small: "px-3 py-2", icon: "h-11 w-11" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-surface-border bg-surface shadow-card", className)}
      {...props}
    />
  );
}
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent",
        className,
      )}
      {...props}
    />
  );
}
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "min-h-11 w-full rounded-xl border border-surface-border bg-surface-elevated px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded-xl bg-surface-elevated", className)} />
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-accent">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-content-secondary">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center p-10 text-center">
      <Inbox className="mb-4 h-9 w-9 text-accent/70" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-5 mt-2 max-w-md text-sm text-content-secondary">{description}</p>
      {children}
    </Card>
  );
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <Card role="alert" className="flex flex-wrap items-center gap-4 border-status-danger/30 p-5">
      <AlertCircle className="h-5 w-5 text-status-danger" />
      <p className="flex-1 text-sm">{message}</p>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      )}
    </Card>
  );
}
export function LoadingState({ label = "Loading workspace…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 p-12 text-sm text-content-secondary"
    >
      <Loader2 className="h-5 w-5 animate-spin text-accent" />
      {label}
    </div>
  );
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl",
            className,
          )}
          aria-describedby={description ? undefined : undefined}
        >
          <DialogPrimitive.Title className="pr-10 text-lg font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            className={description ? "mt-2 text-sm text-content-secondary" : "sr-only"}
          >
            {description || title}
          </DialogPrimitive.Description>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogPrimitive.Close>
          <div className="mt-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className="left-auto right-0 top-0 h-dvh max-h-dvh w-full max-w-md translate-x-0 translate-y-0 rounded-none"
    >
      {children}
    </Dialog>
  );
}
