import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@flow/ui/components/dialog"
import { cn } from "@flow/ui/lib/utils"

type ScreenLoaderProps = {
  mode?: "page" | "dialog"
  label?: string
  className?: string
}

function LoaderBody({
  label = "Checking your session...",
}: Pick<ScreenLoaderProps, "label">) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      {label}
    </div>
  )
}

function ScreenLoader({
  mode = "page",
  label,
  className,
}: ScreenLoaderProps) {
  if (mode === "dialog") {
    return (
      <Dialog open>
        <DialogContent className={cn("max-w-sm", className)} showCloseButton={false}>
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <DialogDescription className="sr-only">
            Please wait while Flow checks the current session.
          </DialogDescription>
          <LoaderBody label={label} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <main
      className={cn(
        "grid min-h-svh place-items-center bg-background text-foreground",
        className
      )}
    >
      <LoaderBody label={label} />
    </main>
  )
}

export { ScreenLoader }
export { LoaderBody }
