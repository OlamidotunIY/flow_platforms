import { Maximize2Icon, MinusIcon, XIcon } from "lucide-react"
import type * as React from "react"

import { Button } from "@flow/ui/components/button"
import { cn } from "@flow/ui/lib/utils"

type WindowControlsProps = {
  className?: string
  onClose?: () => void
  onMaximize?: () => void
  onMinimize?: () => void
  showMaximize?: boolean
}

function WindowControls({
  className,
  onClose,
  onMaximize,
  onMinimize,
  showMaximize = true,
}: WindowControlsProps) {
  function runWindowAction(
    event: React.MouseEvent<HTMLButtonElement>,
    action: (() => void) | undefined,
    channel: string
  ) {
    event.preventDefault()
    event.stopPropagation()
    action?.()

    const ipcRenderer = (
      globalThis as typeof globalThis & {
        window?: {
          ipcRenderer?: {
            invoke?: (channel: string) => Promise<unknown>
            send?: (channel: string) => void
          }
        }
      }
    ).window?.ipcRenderer

    if (!action && ipcRenderer?.invoke) {
      void ipcRenderer.invoke(channel)
      return
    }

    if (!action && ipcRenderer?.send) {
      ipcRenderer.send(channel)
    }
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Button
        aria-label="Minimize window"
        className="opacity-70 hover:opacity-100 [-webkit-app-region:no-drag]"
        onClick={(event) =>
          runWindowAction(event, onMinimize, "flow-window:minimize")
        }
        size="icon-sm"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        type="button"
        variant="ghost"
      >
        <MinusIcon data-icon="inline-start" />
      </Button>
      {showMaximize ? (
        <Button
          aria-label="Maximize window"
          className="opacity-70 hover:opacity-100 [-webkit-app-region:no-drag]"
          onClick={(event) =>
            runWindowAction(event, onMaximize, "flow-window:toggle-maximize")
          }
          size="icon-sm"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          type="button"
          variant="ghost"
        >
          <Maximize2Icon data-icon="inline-start" />
        </Button>
      ) : null}
      <Button
        aria-label="Close window"
        className="opacity-70 hover:bg-destructive/15 hover:text-destructive hover:opacity-100 [-webkit-app-region:no-drag]"
        onClick={(event) =>
          runWindowAction(event, onClose, "flow-window:close")
        }
        size="icon-sm"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        type="button"
        variant="ghost"
      >
        <XIcon data-icon="inline-start" />
      </Button>
    </div>
  )
}

type WindowTitleBarProps = WindowControlsProps & {
  children?: React.ReactNode
  className?: string
  dragClassName?: string
}

function WindowTitleBar({
  children,
  className,
  dragClassName,
  ...controls
}: WindowTitleBarProps) {
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center border-b bg-card/70 text-sm text-card-foreground",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center px-3 font-medium [-webkit-app-region:drag]",
          dragClassName
        )}
      >
        {children}
      </div>
      <div
        className="px-2 [-webkit-app-region:no-drag]"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <WindowControls {...controls} />
      </div>
    </div>
  )
}

export { WindowControls, WindowTitleBar }
