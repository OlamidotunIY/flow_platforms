import { Link } from "react-router-dom"
import {
  FolderOpen,
  MoreHorizontal,
  Plus,
  Send,
  Settings2,
  Star,
} from "lucide-react"
import { Button } from "@flow/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flow/ui/components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@flow/ui/components/sidebar"

import { PATHS } from "../routing/paths"
import type { SidebarProjectGroup } from "./sidebar-data"

export function NavProjects({
  groups,
  onCreateProject,
}: {
  groups: SidebarProjectGroup[]
  onCreateProject: (teamId?: string | null) => void
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="mb-1 flex items-center justify-between px-2">
        <SidebarGroupLabel className="h-auto p-0 text-[0.7rem] uppercase tracking-wide text-sidebar-foreground/50">
          Projects
        </SidebarGroupLabel>
        <Link
          className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
          to={PATHS.projects.root}
        >
          View all
        </Link>
      </div>
      <SidebarMenu>
        {groups.map((group) => (
          <SidebarMenuItem key={group.id}>
            <div className="group/team flex items-center gap-1 px-2 py-1 text-xs font-medium text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              <span className="min-w-0 flex-1 truncate">{group.name}</span>
              <Button
                aria-label={`Create project in ${group.name}`}
                className="opacity-70 hover:opacity-100"
                onClick={() => onCreateProject(group.teamId)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Plus />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`${group.name} actions`}
                    className="opacity-70 hover:opacity-100"
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <FolderOpen className="text-muted-foreground" />
                      <span>View team projects</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings2 className="text-muted-foreground" />
                      <span>Team settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {group.projects.map((item) => (
              <div className="relative" key={item.id}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More project actions</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <FolderOpen className="text-muted-foreground" />
                        <span>Open project</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="text-muted-foreground" />
                        <span>Pin project</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Send className="text-muted-foreground" />
                        <span>Share project</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="text-sidebar-foreground/70">
            <Link to={PATHS.projects.root}>
              <MoreHorizontal className="text-sidebar-foreground/70" />
              <span>More</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
