import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@flow/ui/components/button"
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

import type {
  FlowDepartmentSummary,
  FlowOrganizationSummary,
} from "../store/userStore"

export function TeamSwitcher({
  activeDepartment,
  activeOrganization,
  onCreateDepartment,
  onDepartmentChange,
  onOrganizationChange,
  organizations,
}: {
  activeDepartment: FlowDepartmentSummary
  activeOrganization: FlowOrganizationSummary
  onCreateDepartment: () => void
  onDepartmentChange: (department: FlowDepartmentSummary) => void
  onOrganizationChange: (organization: FlowOrganizationSummary) => void
  organizations: FlowOrganizationSummary[]
}) {
  const { isMobile } = useSidebar()

  function selectOrganization(organization: FlowOrganizationSummary) {
    onOrganizationChange(organization)

    const nextDepartment =
      organization.activeDepartment ?? organization.departments?.[0]

    if (nextDepartment) {
      onDepartmentChange(nextDepartment)
    }
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
                <span className="text-xs font-medium">
                  {activeOrganization.name.slice(0, 2).toUpperCase()}
                </span>
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
                    <span className="text-[0.625rem] font-medium">
                      {organization.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="grid flex-1">
                    <span className="truncate">{organization.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {organization.slug}
                    </span>
                  </div>
                  {organization.id === activeOrganization.id ? <Check /> : null}
                  <DropdownMenuShortcut>Alt {index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0 text-xs text-muted-foreground">
                Active department
              </DropdownMenuLabel>
              <Button
                aria-label="Create department"
                onClick={onCreateDepartment}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Plus />
              </Button>
            </div>
            <DropdownMenuGroup>
              {activeOrganization.departments?.map((department) => (
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
