import type { ReactNode } from "react"
import { Button } from "@flow/ui/components/button"
import { Skeleton } from "@flow/ui/components/skeleton"

export function WorkspaceLoadingShell({
  description,
  error,
  onRetry,
  title,
}: {
  description: string
  error?: string | null
  onRetry?: () => void
  title: string
}) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="grid min-h-svh grid-cols-[17rem_1fr] opacity-70">
        <aside className="border-r bg-sidebar p-3">
          <Skeleton className="mb-5 h-10 rounded-lg" />
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton className="mb-2 h-8 rounded-md" key={index} />
          ))}
        </aside>
        <section className="p-6">
          <Skeleton className="mb-5 h-20 rounded-xl" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton className="h-32 rounded-xl" key={index} />
            ))}
          </div>
          <Skeleton className="mt-5 h-80 rounded-xl" />
        </section>
      </div>
      <div className="absolute inset-0 grid place-items-center bg-background/45 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border bg-card/95 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 size-10 animate-pulse rounded-xl bg-primary/20" />
          <h1 className="font-heading text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {error ? (
            <>
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
              {onRetry ? (
                <Button className="mt-4" onClick={onRetry} type="button">
                  Retry setup
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export function WorkspaceRecoveryPanel({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="max-w-2xl">
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}
