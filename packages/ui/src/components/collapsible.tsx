import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

type CollapsibleProps = ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

type CollapsibleTriggerProps = ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean
}

type CollapsibleContentProps = ComponentPropsWithoutRef<"div"> & {
  forceMount?: true
  children?: ReactNode
}

function Collapsible({ ...props }: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
