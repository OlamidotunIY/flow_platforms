import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Hash, MessageCircle, Radio, Send, Users } from "lucide-react"
import {
  inboxControllerGetInboxV1,
  inboxControllerGetRoomV1,
  type InboxResponseDto,
  type InboxRoomDetailResponseDto,
  type InboxRoomResponseDto,
} from "@flow/api"
import { Badge } from "@flow/ui/components/badge"
import { Button } from "@flow/ui/components/button"
import { Textarea } from "@flow/ui/components/textarea"
import { EmptyState, InboxSkeleton, PageError } from "../../components/page-state"
import { PATHS } from "../../routing/paths"

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback
}

function RoomLink({ room }: { room: InboxRoomResponseDto }) {
  const isDirect = room.type === "DIRECT"
  const Icon = isDirect ? MessageCircle : Hash

  return (
    <Link
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/35"
      to={PATHS.inbox.detail(room.id)}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{textValue(room.name, "Untitled room")}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {textValue(room.lastMessage?.content ?? room.context, "No messages yet")}
        </span>
      </span>
      {!isDirect ? <Badge variant="outline">{room.memberCount}</Badge> : null}
    </Link>
  )
}

function RoomList({ inbox }: { inbox: InboxResponseDto }) {
  return (
    <aside className="flex min-h-[calc(100svh-10rem)] w-[22rem] shrink-0 flex-col border-r bg-card/80 backdrop-blur">
      <div className="border-b bg-muted/20 p-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
          <Radio className="size-3.5 text-primary" />
          Live workspace
        </div>
        <h1 className="font-heading text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Channels, direct messages, and shared rooms.
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Channels
        </div>
        {inbox.channels.length ? (
          inbox.channels.map((room) => <RoomLink key={room.id} room={room} />)
        ) : (
          <EmptyState
            description="Project, team, and department channels will appear here."
            title="No channels"
          />
        )}
        <div className="mt-4 px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Direct messages
        </div>
        {inbox.directMessages.length ? (
          inbox.directMessages.map((room) => (
            <RoomLink key={room.id} room={room} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
            No direct messages yet.
          </div>
        )}
        <div className="mt-4 px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          People from shared chats
        </div>
        {inbox.availableDirectMessageUsers.map((user) => (
          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/35"
            key={user.id}
          >
            <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Users className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">{user.name}</span>
          </button>
        ))}
      </div>
    </aside>
  )
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
    <div className="overflow-hidden rounded-2xl border bg-card/40 shadow-sm">
      <div className="flex">
        <RoomList inbox={inbox} />
        <main className="relative flex min-h-[calc(100svh-10rem)] flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,oklch(0.448_0.119_151.328_/_0.15),transparent_34%)] p-6 text-center">
          <div className="max-w-md">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle />
            </div>
            <h2 className="font-heading text-2xl font-semibold">
              Select a conversation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open a channel or direct message to continue the thread.
            </p>
          </div>
        </main>
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
      <div className="flex">
        <RoomList inbox={detail.inbox} />
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
    </div>
  )
}
