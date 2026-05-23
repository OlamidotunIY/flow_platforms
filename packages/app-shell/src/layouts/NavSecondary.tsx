import { Link, useLocation } from "react-router-dom"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@flow/ui/components/sidebar"
import { cn } from "@flow/ui/lib/utils"

type NavSecondaryItem = {
  title: string
  url: string
  icon: LucideIcon
}

export function NavSecondary({
  className,
  items,
}: {
  className?: string
  items: NavSecondaryItem[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup className={cn(className)}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.url === location.pathname}
                tooltip={item.title}
              >
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
