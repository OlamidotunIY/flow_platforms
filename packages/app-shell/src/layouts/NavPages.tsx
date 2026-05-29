import { useState } from "react"
import { Link } from "react-router-dom"
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Columns3,
  FileText,
  Home,
  LayoutDashboard,
  List,
  MoreHorizontal,
  Repeat,
  Rows3,
  Target,
  TimerReset,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
} from "@flow/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@flow/ui/components/sidebar"

import { PATHS } from "../routing/paths"

export type SidebarPageView = {
  id: string
  name: string
  type: string
  isDefault?: boolean
}

export type SidebarPage = {
  id: string
  title: string
  icon?: unknown
  isHome?: boolean
  scope?: string
  teamId?: string | null
  views?: SidebarPageView[]
}

export type SidebarPageTeam = {
  icon?: unknown
  id: string
  name: string
  pages: SidebarPage[]
}

function iconFromValue(value: unknown, fallback: LucideIcon): LucideIcon {
  const key = typeof value === "string" ? value : ""
  const icons: Record<string, LucideIcon> = {
    "calendar-days": CalendarDays,
    "check-square": CheckSquare,
    "file-text": FileText,
    home: Home,
    repeat: Repeat,
    target: Target,
    users: Users,
  }
  return icons[key] ?? fallback
}

function pageIcon(value: unknown): LucideIcon {
  return iconFromValue(value, FileText)
}

function teamIcon(value: unknown): LucideIcon {
  return iconFromValue(value, Users)
}

function viewIcon(type: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    BOARD: Columns3,
    CALENDAR: CalendarDays,
    DASHBOARD: LayoutDashboard,
    LIST: List,
    TABLE: Rows3,
    TIMELINE: TimerReset,
  }
  return icons[type] ?? Rows3
}

function defaultPageUrl(page: SidebarPage) {
  return PATHS.pages.detail(page.id)
}

function defaultPageState(page: SidebarPage) {
  const defaultView =
    page.views?.find((view) => view.isDefault) ?? page.views?.[0]
  return defaultView ? { viewId: defaultView.id } : undefined
}

function PageNode({ page }: { page: SidebarPage }) {
  const [open, setOpen] = useState(false)
  const PageIcon = pageIcon(page.icon)
  const hasViews = Boolean(page.views?.length)

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div className="group/page-row h-8 px-1.5">
            {hasViews ? (
              <button
                aria-expanded={open}
                aria-label={`${open ? "Hide" : "Show"} ${page.title} views`}
                className="relative grid size-5 shrink-0 place-items-center rounded-md text-sidebar-foreground/65 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setOpen((current) => !current)
                }}
                type="button"
              >
                <PageIcon
                  className={`absolute size-4 transition-opacity ${
                    open
                      ? "opacity-0"
                      : "opacity-100 group-focus-within/page-row:opacity-0 group-hover/page-row:opacity-0"
                  }`}
                />
                <ChevronRight
                  className={`absolute size-4 transition ${
                    open
                      ? "rotate-90 opacity-100"
                      : "opacity-0 group-focus-within/page-row:opacity-100 group-hover/page-row:opacity-100"
                  }`}
                />
              </button>
            ) : (
              <span className="grid size-5 shrink-0 place-items-center text-sidebar-foreground/65">
                <PageIcon className="size-4" />
              </span>
            )}
            <Link
              className="min-w-0 flex-1 truncate"
              state={defaultPageState(page)}
              to={defaultPageUrl(page)}
            >
              {page.title}
            </Link>
          </div>
        </SidebarMenuButton>
        {hasViews ? (
          <CollapsibleContent>
            <div className="mt-1 ml-5 border-l border-sidebar-border/80 pl-2">
              {page.views?.map((view) => {
                const ViewIcon = viewIcon(view.type)
                return (
                  <SidebarMenuButton
                    asChild
                    className="h-7 text-xs text-sidebar-foreground/70"
                    key={view.id}
                  >
                    <Link
                      state={{ viewId: view.id }}
                      to={PATHS.pages.view(page.id)}
                    >
                      <ViewIcon className="size-3.5" />
                      <span>{view.name}</span>
                    </Link>
                  </SidebarMenuButton>
                )
              })}
            </div>
          </CollapsibleContent>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  )
}

function TeamNode({ team }: { team: SidebarPageTeam }) {
  const [open, setOpen] = useState(true)
  const TeamIcon = teamIcon(team.icon)

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="group/team-row h-8 px-1.5 text-sidebar-foreground/85"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className="relative grid size-5 shrink-0 place-items-center rounded-md text-sidebar-foreground/65 transition group-hover/team-row:bg-sidebar-accent group-hover/team-row:text-sidebar-accent-foreground group-focus-visible/team-row:bg-sidebar-accent">
            <TeamIcon
              className={`absolute size-4 transition-opacity ${
                open
                  ? "opacity-0"
                  : "opacity-100 group-hover/team-row:opacity-0 group-focus-visible/team-row:opacity-0"
              }`}
            />
            <ChevronRight
              className={`absolute size-4 transition ${
                open
                  ? "rotate-90 opacity-100"
                  : "opacity-0 group-hover/team-row:opacity-100 group-focus-visible/team-row:opacity-100"
              }`}
            />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {team.name}
          </span>
          <span className="rounded-md px-1.5 py-0.5 text-[0.65rem] font-medium text-sidebar-foreground/45">
            {team.pages.length}
          </span>
        </SidebarMenuButton>
        <CollapsibleContent>
          <div className="mt-1 ml-5 border-l border-sidebar-border/70 pl-2">
            {team.pages.map((page) => (
              <PageNode key={page.id} page={page} />
            ))}
          </div>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavPages({ teams }: { teams: SidebarPageTeam[] }) {
  const teamsWithPages = teams.filter((team) => team.pages.length)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-[0.7rem] tracking-wide text-sidebar-foreground/50 uppercase">
        Teams
      </SidebarGroupLabel>
      <SidebarMenu>
        {teamsWithPages.map((team) => (
          <TeamNode key={team.id} team={team} />
        ))}
        {!teamsWithPages.length ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <MoreHorizontal />
              <span>No team pages yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}
