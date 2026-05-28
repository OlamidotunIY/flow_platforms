import { useEffect, useState } from "react"
import { History, Send, Sparkles, WandSparkles } from "lucide-react"
import {
  askAiControllerGetHomeV1,
  type AskAiHomeResponseDto,
} from "@flow/api"
import { Button } from "@flow/ui/components/button"
import { Textarea } from "@flow/ui/components/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@flow/ui/components/sheet"
import { AskAiSkeleton, EmptyState, PageError } from "../../components/page-state"

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback
}

export function AskAiPage() {
  const [data, setData] = useState<AskAiHomeResponseDto | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  function loadAskAi() {
    let mounted = true
    setStatus("loading")

    askAiControllerGetHomeV1().then((result) => {
      if (!mounted) return

      if (result.error || !result.data) {
        setStatus("error")
        return
      }

      setData(result.data)
      setStatus("ready")
    })

    return () => {
      mounted = false
    }
  }

  useEffect(() => loadAskAi(), [])

  if (status === "loading") {
    return <AskAiSkeleton />
  }

  if (!data) {
    return (
      <PageError
        onRetry={() => loadAskAi()}
        title="Flow AI is unavailable"
      />
    )
  }

  return (
    <div className="relative isolate flex min-h-[calc(100svh-10rem)] flex-col overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_50%_0%,oklch(0.448_0.119_151.328_/_0.22),transparent_34%),linear-gradient(180deg,oklch(0.218_0.008_223.9_/_0.86),oklch(0.165_0.018_151.4))] p-4 shadow-sm">
      <div className="flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="rounded-full bg-background/60" variant="outline">
              <History />
              Recent chats
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-card/95">
            <SheetHeader>
              <SheetTitle>Recent chats</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4">
              {data.recentChats.length ? (
                data.recentChats.map((chat) => (
                  <button
                    className="rounded-xl border bg-background/45 p-3 text-left transition-colors hover:bg-muted/40"
                    key={chat.id}
                  >
                    <div className="font-medium">{textValue(chat.title, "Untitled chat")}</div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {textValue(chat.preview, "No messages yet")}
                    </p>
                  </button>
                ))
              ) : (
                <EmptyState
                  description="Your recent AI conversations will collect here."
                  title="No recent chats"
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-7 px-4 py-12">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl" />
          <div className="relative grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles />
          </div>
        </div>
        <div className="max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            <WandSparkles className="size-3.5 text-primary" />
            Workspace-aware assistant
          </div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            What can Flow help with?
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Ask about projects, tasks, blockers, docs, team activity, and what
            needs attention next.
          </p>
        </div>
        <div className="grid w-full gap-3 md:grid-cols-2">
          {data.suggestions.map((suggestion) => (
            <button
              className="rounded-2xl border bg-card/70 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted/35"
              key={suggestion.title}
            >
              <div className="font-medium">{suggestion.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {suggestion.prompt}
              </p>
            </button>
          ))}
        </div>
        <div className="flex w-full items-end gap-2 rounded-2xl border bg-card/85 p-2 shadow-lg">
          <Textarea
            className="min-h-28 flex-1 resize-none border-0 bg-transparent text-base shadow-none"
            placeholder="Message Flow AI"
          />
          <Button className="mb-1" size="icon-lg" type="button">
            <Send />
          </Button>
        </div>
      </section>
    </div>
  )
}
