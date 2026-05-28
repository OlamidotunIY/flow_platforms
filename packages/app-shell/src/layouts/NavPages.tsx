import { Link } from "react-router-dom"
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Columns3,
  FileText,
  LayoutDashboard,
  List,
  MoreHorizontal,
  Repeat,
  Rows3,
  Target,
  TimerReset,
  type LucideIcon,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  views?: SidebarPageView[]
}

export type SidebarPageTeam = {
  id: string
  name: string
  pages: SidebarPage[]
}

function pageIcon(value: unknown): LucideIcon {
  const key = typeof value === "string" ? value : ""
  const icons: Record<string, LucideIcon> = {
    "calendar-days": CalendarDays,
    "check-square": CheckSquare,
    "file-text": FileText,
    repeat: Repeat,
    target: Target,
  }
  return icons[key] ?? FileText
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
  const defaultView = page.views?.find((view) => view.isDefault) ?? page.views?.[0]
  return defaultView ? PATHS.pages.view(page.id, defaultView.id) : PATHS.pages.detail(page.id)
}

function PageNode({ page }: { page: SidebarPage }) {
  const PageIcon = pageIcon(page.icon)
  const hasViews = Boolean(page.views?.length)

  return (
    <Collapsible defaultOpen={false}>
      <SidebarMenuItem>
        <div className="group/page relative">
          <SidebarMenuButton asChild>
            <Link to={defaultPageUrl(page)}>
              <span className="relative grid size-4 place-items-center">
                <PageIcon className="absolute size-4 transition-opacity group-hover/page:opacity-0 group-focus-within/page:opacity-0" />
                <ChevronRight className="absolute size-4 opacity-0 transition-opacity group-hover/page:opacity-100 group-focus-within/page:opacity-100" />
              </span>
              <span>{page.title}</span>
            </Link>
          </SidebarMenuButton>
          {hasViews ? (
            <CollapsibleTrigger asChild>
              <button
                aria-label={`Show ${page.title} views`}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-md text-sidebar-foreground/55 opacity-0 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/page:opacity-100 group-focus-within/page:opacity-100"
                type="button"
              >
                <ChevronRight className="size-4 transition-transform data-[state=open]:rotate-90" />
              </button>
            </CollapsibleTrigger>
          ) : null}
        </div>
        {hasViews ? (
          <CollapsibleContent>
            <div className="ml-4 mt-1 border-l border-sidebar-border pl-2">
              {page.views?.map((view) => {
                const ViewIcon = viewIcon(view.type)
                return (
                  <SidebarMenuButton asChild className="h-7 text-xs" key={view.id}>
                    <Link to={PATHS.pages.view(page.id, view.id)}>
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

export function NavPages({
  pages,
  teams,
}: {
  pages: SidebarPage[]
  teams: SidebarPageTeam[]
}) {
  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wide text-sidebar-foreground/50">
          Pages
        </SidebarGroupLabel>
        <SidebarMenu>
          {pages.map((page) => (
            <PageNode key={page.id} page={page} />
          ))}
          {!pages.length ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <MoreHorizontal />
                <span>No shared pages</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-wide text-sidebar-foreground/50">
          Teams
        </SidebarGroupLabel>
        <SidebarMenu>
          {teams.map((team) => (
            <SidebarMenuItem key={team.id}>
              <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/60">
                {team.name}
              </div>
              {team.pages.map((page) => (
                <PageNode key={page.id} page={page} />
              ))}
            </SidebarMenuItem>
          ))}
          {!teams.length ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <MoreHorizontal />
                <span>No teams yet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
