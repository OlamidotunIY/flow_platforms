import { useMemo, useState, type ComponentProps, type ReactNode } from "react"
import { Link } from "react-router-dom"
import
{
  Check,
  ChevronRight,
  ChevronsLeft,
  CircleUserRound,
  CalendarClock,
  Hash,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  Plus,
  Settings,
  UserPlus,
} from "lucide-react"
import type {
  DepartmentSummaryResponseDto,
  OrganizationSummaryResponseDto,
} from "@flow/api"
import
{
  Sidebar,
  SidebarContent,
  SidebarRail,
  useSidebar,
} from "@flow/ui/components/sidebar"
import { Button } from "@flow/ui/components/button"

import
{
  type FlowUserInfo,
  type WorkspaceSidebarDepartment,
  type WorkspaceSidebarMeeting,
  type WorkspaceSidebarRecentAiChat,
  type WorkspaceSidebarRoom,
  useUserStore,
} from "../store/userStore"
import { NavMain } from "./NavMain"
import
{
  NavDepartments,
  NavPages,
  type SidebarPage,
  type SidebarPageDepartment,
  type SidebarPageTeam,
} from "./NavPages"
import { NavSecondary } from "./NavSecondary"
import { isDesktopPlatform, PATHS } from "@flow/app-shell"
import { sidebarNavMain, sidebarNavSecondary } from "@flow/ui/lib/sidebar-data"

function initials(value: string)
{
  const words = value.trim().split(/\s+/).filter(Boolean)
  const letters =
    words.length > 1
      ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
      : value.slice(0, 1)

  return letters.toUpperCase() || "W"
}

function previewText(value: unknown, fallback: string)
{
  return typeof value === "string" && value.trim() ? value : fallback
}

function formatMeetingTime(value: unknown)
{
  if (typeof value !== "string" || !value)
  {
    return "No time"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
  {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(date)
}

function SidebarPanel({
  children,
  title,
}: {
  children: ReactNode
  title: string
})
{
  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <div className="px-3 pt-3 pb-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
        {title}
      </div>
      <div className="px-2">{children}</div>
    </div>
  )
}

function EmptySidebarList({ label }: { label: string })
{
  return (
    <div className="mx-1 rounded-md border border-dashed border-sidebar-border/80 px-3 py-2 text-xs text-sidebar-foreground/55">
      {label}
    </div>
  )
}

function SidebarRoomLink({ room }: { room: WorkspaceSidebarRoom })
{
  const isDirect = room.type === "DIRECT"
  const Icon = isDirect ? MessageCircle : Hash

  return (
    <Link
      className="flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/85 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      to={PATHS.inbox.detail(room.id)}
    >
      <Icon className="size-4 shrink-0 text-sidebar-foreground/60" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{room.name}</span>
        <span className="block truncate text-xs text-sidebar-foreground/50">
          {previewText(room.lastMessage?.content ?? room.context, "No messages yet")}
        </span>
      </span>
    </Link>
  )
}

function SidebarInboxList({
  channels,
  directMessages,
}: {
  channels: WorkspaceSidebarRoom[]
  directMessages: WorkspaceSidebarRoom[]
})
{
  return (
    <>
      <SidebarPanel title="Channels">
        {channels.length ? (
          channels.map((room) => <SidebarRoomLink key={room.id} room={room} />)
        ) : (
          <EmptySidebarList label="No channels yet" />
        )}
      </SidebarPanel>
      <SidebarPanel title="Direct Messages">
        {directMessages.length ? (
          directMessages.map((room) => (
            <SidebarRoomLink key={room.id} room={room} />
          ))
        ) : (
          <EmptySidebarList label="No direct messages yet" />
        )}
      </SidebarPanel>
    </>
  )
}

function SidebarMessageList({
  chats,
}: {
  chats: WorkspaceSidebarRecentAiChat[]
})
{
  return (
    <SidebarPanel title="Recent AI Chats">
      {chats.length ? (
        chats.map((chat) => (
          <Link
            className="flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/85 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            key={chat.id}
            to={PATHS.app.askAi}
          >
            <MessagesSquare className="size-4 shrink-0 text-sidebar-foreground/60" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{chat.title}</span>
              <span className="block truncate text-xs text-sidebar-foreground/50">
                {previewText(chat.preview, "No preview yet")}
              </span>
            </span>
          </Link>
        ))
      ) : (
        <EmptySidebarList label="No recent AI chats yet" />
      )}
    </SidebarPanel>
  )
}

function SidebarMeetingList({
  meetings,
}: {
  meetings: WorkspaceSidebarMeeting[]
})
{
  return (
    <SidebarPanel title="Upcoming Meetings">
      {meetings.length ? (
        meetings.map((meeting) => (
          <Link
            className="flex min-h-10 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/85 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            key={meeting.id}
            to={PATHS.app.meetings}
          >
            <CalendarClock className="size-4 shrink-0 text-sidebar-foreground/60" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{meeting.title}</span>
              <span className="block truncate text-xs text-sidebar-foreground/50">
                {formatMeetingTime(meeting.startsAt)}
              </span>
            </span>
          </Link>
        ))
      ) : (
        <EmptySidebarList label="No upcoming meetings" />
      )}
    </SidebarPanel>
  )
}

export function AppSidebar({
  activeDepartment,
  activeOrganizationId,
  onDepartmentChange,
  onDepartmentClear,
  onOrganizationChange,
  onSignOut,
  ...props
}: ComponentProps<typeof Sidebar> & {
  activeDepartment: WorkspaceSidebarDepartment | null
  activeOrganizationId?: string | null
  onDepartmentChange: (
    department: WorkspaceSidebarDepartment | DepartmentSummaryResponseDto
  ) => void
  onDepartmentClear: () => void
  onOrganizationChange: (
    organization:
      | NonNullable<FlowUserInfo["activeOrganization"]>
      | OrganizationSummaryResponseDto
  ) => void
  onSignOut: () => void
})
{
  const userInfo = useUserStore((state) => state.userInfo)
  const { toggleSidebar } = useSidebar()
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  const pageNavigation = useMemo(() =>
  {
    const organization = userInfo?.activeOrganization
    const departments: SidebarPageDepartment[] = (
      (organization?.departments ?? []) as Array<
        DepartmentSummaryResponseDto & { pages?: SidebarPage[] }
      >
    ).map((department) => ({
      color: department.color,
      createdAt: department.createdAt,
      description: department.description,
      id: department.id,
      name: department.name,
      organizationId: department.organizationId,
      pages: department.pages ?? [],
      updatedAt: department.updatedAt,
    }))
    const visibleTeams = activeDepartment
      ? (organization?.teams ?? []).filter(
        (team) => team.departmentId === activeDepartment.id
      )
      : (organization?.teams ?? [])
    const teamPages: SidebarPageTeam[] = visibleTeams
      .map((team) => ({
        icon: (team as { icon?: unknown }).icon,
        id: team.id,
        name: team.name,
        pages: ((team.pages ?? []) as SidebarPage[]).filter(
          (page) => page.id && page.scope === "TEAM"
        ),
      }))
      .filter((team) => team.pages.length)

    return {
      departments,
      teams: teamPages,
    }
  }, [activeDepartment, userInfo])

  if (!userInfo || !activeOrganizationId)
  {
    return null
  }

  const activeOrganization = userInfo.activeOrganization
  const activeWorkspaceName = activeOrganization?.name ?? "Workspace"
  const activeDepartmentName = activeDepartment?.name ?? null
  const isDepartmentView = Boolean(activeDepartment)
  const activeTab = userInfo.activeTab ?? "home"
  const showWindowsAppLink = !isDesktopPlatform()
  const organizations = userInfo.activeOrganization
    ? [
      userInfo.activeOrganization,
      ...(userInfo.organizations ?? []).filter(
        (organization) => organization.id !== userInfo.activeOrganization?.id
      ),
    ]
    : []

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <div className="relative flex h-11 items-center gap-1 border-b border-border p-1 group-data-[collapsible=icon]:hidden">
        <Button
          className="h-9 min-w-0 flex-1 justify-start gap-2 px-2"
          onClick={() => setWorkspaceOpen((open) => !open)}
          type="button"
          variant="ghost"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-sidebar-accent text-xs font-semibold">
            {initials(activeWorkspaceName)}
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left font-semibold">
            <span className="min-w-0 truncate">{activeWorkspaceName}</span>
            {activeDepartmentName ? (
              <>
                <ChevronRight className="size-3.5 shrink-0 text-sidebar-foreground/45" />
                <span className="min-w-0 truncate text-sidebar-foreground/75">
                  {activeDepartmentName}
                </span>
              </>
            ) : null}
          </span>
        </Button>
        <Button
          aria-label="Collapse sidebar"
          className="size-8 shrink-0 text-sidebar-foreground/55"
          onClick={() =>
          {
            setWorkspaceOpen(false)
            toggleSidebar()
          }}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        {workspaceOpen ? (
          <div className="absolute top-[calc(100%-0.25rem)] left-2 z-[200] w-[18rem] rounded-lg border bg-popover text-popover-foreground shadow-xl">
            <div className="flex gap-3 p-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-lg font-semibold text-muted-foreground">
                {initials(activeWorkspaceName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {activeWorkspaceName}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Free Plan &middot; 1 member
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 px-2 pb-2">
              <Button
                asChild
                className="h-7 gap-1.5 px-2 text-xs"
                size="sm"
                variant="outline"
              >
                <Link
                  onClick={() => setWorkspaceOpen(false)}
                  to={PATHS.app.settings}
                >
                  <Settings className="size-3.5" />
                  Settings
                </Link>
              </Button>
              <Button
                className="h-7 gap-1.5 px-2 text-xs"
                size="sm"
                variant="outline"
              >
                <UserPlus className="size-3.5" />
                Invite members
              </Button>
            </div>
            <div className="border-t py-1.5">
              <div className="flex h-8 items-center gap-2 px-2 text-sm text-muted-foreground">
                <span className="grid size-5 shrink-0 place-items-center rounded-full border text-[0.65rem]">
                  1
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {userInfo.user.email}
                </span>
                <button
                  aria-label="Account actions"
                  className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-muted hover:text-foreground"
                  type="button"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
              {organizations.map((organization) =>
              {
                const isActive = organization.id === activeOrganization?.id
                const departments = isActive
                  ? (activeOrganization?.departments ?? [])
                  : []
                const showDepartments = departments.length > 0

                return (
                  <div
                    className="group/workspace relative"
                    key={organization.id}
                  >
                    <button
                      className="flex h-8 w-full items-center gap-2 px-3 text-left text-sm hover:bg-muted"
                      onClick={() =>
                      {
                        setWorkspaceOpen(false)
                        onOrganizationChange(organization)
                      }}
                      type="button"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {organization.name}
                      </span>
                      {showDepartments ? (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      ) : null}
                      {isActive && !activeDepartment ? (
                        <Check className="size-4" />
                      ) : null}
                    </button>
                    {showDepartments ? (
                      <div className="invisible absolute top-0 left-[calc(100%-0.25rem)] z-[210] w-56 rounded-lg border bg-popover p-1 text-popover-foreground opacity-0 shadow-xl transition-opacity group-hover/workspace:visible group-hover/workspace:opacity-100">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Departments
                        </div>
                        <button
                          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted"
                          onClick={() =>
                          {
                            setWorkspaceOpen(false)
                            onDepartmentClear()
                          }}
                          type="button"
                        >
                          <span className="min-w-0 flex-1 truncate">None</span>
                          {!activeDepartment ? (
                            <Check className="size-4" />
                          ) : null}
                        </button>
                        <div className="-mx-1 my-1 h-px bg-border/60" />
                        {departments.map((department) => (
                          <button
                            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted"
                            key={department.id}
                            onClick={() =>
                            {
                              setWorkspaceOpen(false)
                              onDepartmentChange(department)
                            }}
                            type="button"
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {department.name}
                            </span>
                            {department.id === activeDepartment?.id ? (
                              <Check className="size-4" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
              <button
                className="flex h-8 w-full items-center gap-2 px-3 text-left text-sm text-primary hover:bg-muted"
                type="button"
              >
                <Plus className="size-4" />
                <span>New Workspace</span>
              </button>
            </div>
            <div className="border-t px-2 py-2">
              <button
                className="flex h-9 w-full items-center gap-2 rounded-md px-1 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                type="button"
              >
                <CircleUserRound className="size-5" />
                <span>Add new account</span>
              </button>
            </div>
            <div className="mx-3 h-px bg-border" />
            <div className="px-2 py-2">
              <button
                className="block h-7 w-full rounded-md px-1 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() =>
                {
                  setWorkspaceOpen(false)
                  onSignOut()
                }}
                type="button"
              >
                Log out all accounts
              </button>
              {showWindowsAppLink ? (
                <button
                  className="block h-7 w-full rounded-md px-1 text-left text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  type="button"
                >
                  Get Windows app
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <SidebarContent>
        <NavMain
          homeTitle={activeDepartmentName ?? activeWorkspaceName}
          items={sidebarNavMain}
        />
        {activeTab === "home" ? (
          isDepartmentView ? (
            <NavPages teams={pageNavigation.teams} />
          ) : (
            <NavDepartments
              activeDepartmentId={activeDepartment?.id}
              departments={pageNavigation.departments}
              onDepartmentChange={(department) =>
              {
                onDepartmentChange(department as unknown as WorkspaceSidebarDepartment)
              }}
            />
          )
        ) : null}
        {activeTab === "inbox" ? (
          <SidebarInboxList
            channels={userInfo.inbox?.channels ?? []}
            directMessages={userInfo.inbox?.directMessages ?? []}
          />
        ) : null}
        {activeTab === "message" ? (
          <SidebarMessageList chats={userInfo.message?.recentChats ?? []} />
        ) : null}
        {activeTab === "meeting" ? (
          <SidebarMeetingList meetings={userInfo.meeting?.upcomingMeetings ?? []} />
        ) : null}
        <div className="mt-auto">
          <NavSecondary items={sidebarNavSecondary} />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
