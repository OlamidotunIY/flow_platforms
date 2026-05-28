import { useMemo, type ComponentProps } from "react"
import type { ActiveDepartmentResponseDto } from "@flow/api"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@flow/ui/components/sidebar"

import { useUserStore } from "../store/userStore"
import { NavMain } from "./NavMain"
import { NavPages, type SidebarPage, type SidebarPageTeam } from "./NavPages"
import { NavSecondary } from "./NavSecondary"
import { NavUser } from "./NavUser"
import {
  sidebarNavMain,
  sidebarNavSecondary,
} from "./sidebar-data"

export function AppSidebar({
  activeDepartment,
  activeOrganizationId,
  onSignOut,
  ...props
}: ComponentProps<typeof Sidebar> & {
  activeDepartment: ActiveDepartmentResponseDto | null
  activeOrganizationId?: string | null
  onSignOut: () => void
}) {
  const userInfo = useUserStore((state) => state.userInfo)

  const pageNavigation = useMemo(() => {
    const organization = userInfo?.activeOrganization
    const organizationPages = (organization?.pages ?? []) as SidebarPage[]
    const departmentPages = ((activeDepartment as ActiveDepartmentResponseDto & { pages?: SidebarPage[] } | null)?.pages ?? []) as SidebarPage[]
    const teamPages: SidebarPageTeam[] = (organization?.teams ?? [])
      .map((team) => ({
        id: team.id,
        name: team.name,
        pages: ((team.pages ?? []) as SidebarPage[]).filter((page) => page.id),
      }))
      .filter((team) => team.pages.length)

    return {
      pages: [...organizationPages, ...departmentPages],
      teams: teamPages,
    }
  }, [activeDepartment, userInfo])

  if (!userInfo || !activeOrganizationId) {
    return null
  }

  const sidebarProfile = {
    name: String(userInfo.user.name ?? userInfo.user.email),
    email: userInfo.user.email,
    avatar:
      typeof userInfo.user.image === "string"
        ? userInfo.user.image
        : typeof userInfo.user.avatarUrl === "string"
          ? userInfo.user.avatarUrl
          : null,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={sidebarNavMain} />
        <NavPages pages={pageNavigation.pages} teams={pageNavigation.teams} />
        <NavSecondary items={sidebarNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onSignOut={onSignOut} user={sidebarProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
