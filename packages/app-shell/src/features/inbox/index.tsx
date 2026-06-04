import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { MessageCircle, Send } from "lucide-react"
import {
  inboxControllerGetInboxV1,
  inboxControllerGetRoomV1,
  type InboxResponseDto,
  type InboxRoomDetailResponseDto,
} from "@flow/api"
import { Badge } from "@flow/ui/components/badge"
import { Button } from "@flow/ui/components/button"
import { Textarea } from "@flow/ui/components/textarea"
import { EmptyState, InboxSkeleton, PageError } from "../../components/page-state"

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback
}

export function InboxPage() {
  const [inbox, setInbox] = useState<InboxResponseDto | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  function loadInbox() {
    let mounted = true
    setStatus("loading")

    inboxControllerGetInboxV1().then((result) => {
      if (!mounted) return

      if (result.error || !result.data) {
        setStatus("error")
        return
      }

      setInbox(result.data)
      setStatus("ready")
    })

    return () => {
      mounted = false
    }
  }

  useEffect(() => loadInbox(), [])

  if (status === "loading") {
    return <InboxSkeleton />
  }

  if (!inbox) {
    return <PageError onRetry={() => loadInbox()} title="Inbox unavailable" />
  }

  return (
    <div className="relative flex min-h-[calc(100svh-10rem)] flex-1 items-center justify-center overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_50%_0%,oklch(0.448_0.119_151.328_/_0.15),transparent_34%),linear-gradient(180deg,var(--card),var(--background))] p-6 text-center shadow-sm">
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <MessageCircle />
        </div>
        <h2 className="font-heading text-2xl font-semibold">
          Select a conversation
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open a channel or direct message from the sidebar to continue the
          thread.
        </p>
      </div>
    </div>
  )
}

export function InboxRoomPage() {
  const { chatRoomId } = useParams()
  const [detail, setDetail] = useState<InboxRoomDetailResponseDto | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  function loadRoom(roomId: string) {
    let mounted = true
    setStatus("loading")

    inboxControllerGetRoomV1({ path: { chatRoomId: roomId } }).then((result) => {
      if (!mounted) return

      if (result.error || !result.data) {
        setStatus("error")
        return
      }

      setDetail(result.data)
      setStatus("ready")
    })

    return () => {
      mounted = false
    }
  }

  useEffect(() => {
    if (!chatRoomId) return
    return loadRoom(chatRoomId)
  }, [chatRoomId])

  if (status === "loading") {
    return <InboxSkeleton />
  }

  if (!detail || !chatRoomId) {
    return (
      <PageError
        onRetry={() => {
          if (chatRoomId) loadRoom(chatRoomId)
        }}
        title="Chat room unavailable"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card/40 shadow-sm">
        <main className="flex min-h-[calc(100svh-10rem)] flex-1 flex-col bg-background/75">
          <header className="flex items-center justify-between border-b bg-card/85 p-5 backdrop-blur">
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
                {detail.room.type}
              </div>
              <h1 className="font-heading text-2xl font-semibold">
                {textValue(detail.room.name, "Untitled room")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {textValue(detail.room.context, "Workspace conversation")}
              </p>
            </div>
            <Badge variant="outline">{detail.members.length} members</Badge>
          </header>
          <div className="flex-1 space-y-3 overflow-auto p-5">
            {detail.messages.length ? (
              detail.messages.map((message) => (
                <div
                  className="max-w-2xl rounded-2xl border bg-card/85 p-4 shadow-sm"
                  key={message.id}
                >
                  <div className="text-sm font-medium">
                    {textValue(message.sender.name ?? message.sender.email)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {textValue(message.content)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                description="Messages will appear here once this conversation starts."
                title="No messages yet"
              />
            )}
          </div>
          <div className="border-t bg-card/85 p-3 backdrop-blur">
            <div className="flex items-end gap-2 rounded-2xl border bg-background/70 p-2">
              <Textarea
                className="min-h-16 resize-none border-0 bg-transparent shadow-none"
                placeholder={`Message ${detail.room.name}`}
              />
              <Button size="icon-lg" type="button">
                <Send />
              </Button>
            </div>
          </div>
        </main>
    </div>
  )
}
