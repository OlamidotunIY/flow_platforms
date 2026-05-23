import { Check, ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@flow/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@flow/ui/components/sidebar"

import type { SidebarDepartment, SidebarOrganization } from "./sidebar-data"

export function TeamSwitcher({
  activeDepartment,
  activeOrganization,
  onDepartmentChange,
  onOrganizationChange,
  organizations,
}: {
  activeDepartment: SidebarDepartment
  activeOrganization: SidebarOrganization
  onDepartmentChange: (department: SidebarDepartment) => void
  onOrganizationChange: (organization: SidebarOrganization) => void
  organizations: SidebarOrganization[]
}) {
  const { isMobile } = useSidebar()

  function selectOrganization(organization: SidebarOrganization) {
    onOrganizationChange(organization)
    onDepartmentChange(organization.departments[0])
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeOrganization.logo />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrganization.name}
                </span>
                <span className="truncate text-xs">{activeDepartment.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {organizations.map((organization, index) => (
                <DropdownMenuItem
                  key={organization.id}
                  onSelect={() => selectOrganization(organization)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <organization.logo />
                  </div>
                  <div className="grid flex-1">
                    <span className="truncate">{organization.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {organization.plan}
                    </span>
                  </div>
                  {organization.id === activeOrganization.id ? <Check /> : null}
                  <DropdownMenuShortcut>Alt {index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Active stream
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {activeOrganization.departments.map((department) => (
                <DropdownMenuItem
                  key={department.id}
                  onSelect={() => onDepartmentChange(department)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {department.id === activeDepartment.id ? <Check /> : null}
                  </div>
                  <span className="truncate">{department.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
