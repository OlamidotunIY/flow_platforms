import { Link, useLocation } from "react-router-dom"
import { Search, type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@flow/ui/components/sidebar"
import { Button } from "@flow/ui/components/button"

type NavMainItem = {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
  isActive?: boolean
}

export function NavMain({
  homeTitle,
  items,
}: {
  homeTitle: string
  items: NavMainItem[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupContent>
        <SidebarMenu className="flex-row items-center gap-1 px-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
          {items.map((item) => {
            const isActive =
              item.url === PATHS_ROOT
                ? location.pathname === item.url ||
                  location.pathname.startsWith("/p/")
                : location.pathname.startsWith(item.url)
            const title = item.url === PATHS_ROOT ? homeTitle : item.title

            return (
              <SidebarMenuItem
                className={`min-w-0 ${isActive ? "" : "group-data-[collapsible=icon]:hidden"}`}
                key={item.title}
              >
                <SidebarMenuButton
                  asChild
                  className={`h-9 rounded-md px-2.5 transition ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  isActive={isActive}
                  tooltip={title}
                >
                  <Link to={item.url}>
                    <item.icon className="size-4" />
                    {isActive ? <span className="font-medium">{title}</span> : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
          <SidebarMenuItem className="ml-auto group-data-[collapsible=icon]:hidden">
            <Button
              aria-label="Search workspace"
              className="size-9 rounded-full text-sidebar-foreground/70"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Search className="size-4" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const PATHS_ROOT = "/"
