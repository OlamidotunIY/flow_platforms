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

export function NavMain({ items }: { items: NavMainItem[] }) {
  const location = useLocation()

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupContent>
        <SidebarMenu className="flex-row items-center gap-1 px-1">
          {items.map((item) => {
            const isActive =
              item.url === PATHS_ROOT
                ? location.pathname === item.url
                : location.pathname.startsWith(item.url)

            return (
              <SidebarMenuItem className="min-w-0" key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`h-9 rounded-full px-2.5 ${
                    isActive ? "bg-sidebar-accent" : ""
                  }`}
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link to={item.url}>
                    <item.icon className="size-4" />
                    {isActive ? <span>{item.title}</span> : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
          <SidebarMenuItem className="ml-auto">
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
