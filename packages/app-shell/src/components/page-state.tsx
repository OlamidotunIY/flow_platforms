import type { ReactNode } from "react"
import { AlertCircle, RefreshCw, Search } from "lucide-react"
import { Button } from "@flow/ui/components/button"
import { Skeleton } from "@flow/ui/components/skeleton"

export function PageFrame({
  children,
  eyebrow,
  title,
  description,
  action,
}: {
  children: ReactNode
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="relative isolate flex flex-col gap-5 overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </div>
  )
}

export function StandaloneSection({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`standalone-widget rounded-xl border bg-card/85 shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border bg-card/70 p-5">
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="mb-3 h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card/70">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <Skeleton className="mb-2 h-5 w-36" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
        <div className="flex gap-3 overflow-hidden p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-32 min-w-56 rounded-lg" key={index} />
          ))}
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div className="overflow-hidden rounded-xl border bg-card/70" key={sectionIndex}>
          <div className="flex items-center justify-between border-b p-3">
            <div>
              <Skeleton className="mb-2 h-5 w-40" />
              <Skeleton className="h-3 w-72" />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((__, iconIndex) => (
                <Skeleton className="size-7 rounded-md" key={iconIndex} />
              ))}
            </div>
          </div>
          <div className="p-3">
            <div className="mb-2 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton className="h-8 rounded-md" key={index} />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 border-t py-2" key={rowIndex}>
                {Array.from({ length: 5 }).map((__, cellIndex) => (
                  <Skeleton className="h-7 rounded-md" key={cellIndex} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card/70 p-5">
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="mb-3 h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="rounded-xl border bg-card/70 p-3">
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card/70">
        <div className="border-b p-4">
          <Skeleton className="mb-2 h-5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="border-b p-4 last:border-b-0" key={index}>
            <Skeleton className="mb-2 h-4 w-72" />
            <Skeleton className="h-3 w-full max-w-2xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AskAiSkeleton() {
  return (
    <div className="relative grid min-h-[calc(100svh-10rem)] place-items-center rounded-2xl border bg-card/55 p-6">
      <Skeleton className="absolute right-5 top-5 h-8 w-32 rounded-full" />
      <div className="flex w-full max-w-4xl flex-col items-center gap-6">
        <Skeleton className="size-14 rounded-2xl" />
        <Skeleton className="h-12 w-2/3 rounded-xl" />
        <div className="grid w-full gap-3 md:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function InboxSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-2xl border bg-card/55">
      <div className="w-[22rem] border-r p-4">
        <Skeleton className="mb-4 h-20 rounded-xl" />
        <Skeleton className="mb-3 h-9 rounded-lg" />
        <Skeleton className="mb-2 h-10 rounded-xl" />
        <Skeleton className="mb-2 h-10 rounded-xl" />
        <Skeleton className="mb-2 h-10 rounded-xl" />
        <Skeleton className="mt-6 h-10 rounded-xl" />
        <Skeleton className="mb-2 h-10 rounded-xl" />
      </div>
      <div className="flex-1 p-5">
        <Skeleton className="mb-4 h-20 rounded-xl" />
        <Skeleton className="mb-3 h-20 max-w-xl rounded-2xl" />
        <Skeleton className="mb-3 h-20 max-w-lg rounded-2xl" />
        <Skeleton className="mt-24 h-24 rounded-2xl" />
      </div>
    </div>
  )
}

export function PageLoader({ label = "Loading page" }: { label?: string }) {
  return (
    <div className="flex min-h-[calc(100svh-10rem)] flex-col gap-5">
      <div className="rounded-xl border bg-card/70 p-5">
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="mb-3 h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card/70">
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <span className="text-xs text-muted-foreground">{label}...</span>
        </div>
        <div className="space-y-3 p-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function PageError({
  message,
  onRetry,
  title = "Unable to load this page",
}: {
  message?: string
  onRetry?: () => void
  title?: string
}) {
  return (
    <div className="grid min-h-[calc(100svh-10rem)] place-items-center">
      <div className="max-w-xl rounded-2xl border bg-card/85 p-6 text-center shadow-lg backdrop-blur">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle />
        </div>
        <h1 className="font-heading text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {message ??
            "The backend did not return the data this page needs. Check that the API server has reloaded the latest source."}
        </p>
        {onRetry ? (
          <Button className="mt-5" onClick={onRetry} type="button">
            <RefreshCw />
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="grid min-h-48 place-items-center rounded-xl border border-dashed bg-muted/20 p-6 text-center">
      <div>
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Search className="size-4" />
        </div>
        <div className="font-medium">{title}</div>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
