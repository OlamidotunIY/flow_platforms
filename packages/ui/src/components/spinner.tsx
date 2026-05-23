import { cn } from "@flow/ui/lib/utils"

function Spinner({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
