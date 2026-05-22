import * as React from "react"

import { cn } from "@flow/ui/lib/utils"
import { Separator } from "@flow/ui/components/separator"

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-xs font-medium text-foreground", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground *:[a]:font-medium *:[a]:text-foreground *:[a]:underline-offset-4 *:[a]:hover:underline",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn("relative flex items-center gap-3 py-1", className)}
      {...props}
    >
      <Separator className="flex-1" />
      {children ? (
        <span
          data-slot="field-separator-content"
          className="bg-background px-1 text-xs text-muted-foreground"
        >
          {children}
        </span>
      ) : null}
      <Separator className="flex-1" />
    </div>
  )
}

export {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
}
