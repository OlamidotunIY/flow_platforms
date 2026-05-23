import type { LucideIcon } from "lucide-react"
import {
  Building2,
  CalendarClock,
  ClipboardList,
  FolderKanban,
  Gauge,
  KanbanSquare,
  Layers3,
  MessagesSquare,
  Settings2,
  Sparkles,
  Workflow,
} from "lucide-react"

import { PATHS } from "../routing/paths"

export type SidebarProject = {
  name: string
  url: string
  icon: LucideIcon
}

export type SidebarDepartment = {
  id: string
  name: string
  projects: SidebarProject[]
}

export type SidebarOrganization = {
  id: string
  name: string
  logo: LucideIcon
  plan: string
  departments: SidebarDepartment[]
}

export type SidebarUser = {
  name: string
  email: string
  avatar?: string | null
}

export const sidebarUser: SidebarUser = {
  name: "Olami Flow",
  email: "olami@flow.local",
  avatar: null,
}

export const sidebarOrganizations: SidebarOrganization[] = [
  {
    id: "flow-labs",
    name: "Flow Labs",
    logo: Workflow,
    plan: "Workspace",
    departments: [
      {
        id: "product-stream",
        name: "Product Stream",
        projects: [
          {
            name: "Command Center",
            url: PATHS.messages.root,
            icon: FolderKanban,
          },
          {
            name: "Launch Tasks",
            url: PATHS.messages.root,
            icon: ClipboardList,
          },
          {
            name: "Sprint Pulse",
            url: PATHS.messages.root,
            icon: CalendarClock,
          },
        ],
      },
      {
        id: "ops-stream",
        name: "Operations Stream",
        projects: [
          {
            name: "Ops Dashboard",
            url: PATHS.messages.root,
            icon: Gauge,
          },
          {
            name: "Process Map",
            url: PATHS.messages.root,
            icon: Layers3,
          },
        ],
      },
    ],
  },
  {
    id: "northstar",
    name: "Northstar Studio",
    logo: Building2,
    plan: "Client",
    departments: [
      {
        id: "delivery-stream",
        name: "Delivery Stream",
        projects: [
          {
            name: "Roadmap Board",
            url: PATHS.messages.root,
            icon: KanbanSquare,
          },
          {
            name: "Client Inbox",
            url: PATHS.messages.root,
            icon: MessagesSquare,
          },
          {
            name: "Growth Ideas",
            url: PATHS.messages.root,
            icon: Sparkles,
          },
        ],
      },
    ],
  },
]

export const sidebarNavMain = [
  {
    title: "Workspace",
    url: PATHS.root,
    icon: Gauge,
    isActive: true,
    items: [
      {
        title: "Messages",
        url: PATHS.messages.root,
      },
      {
        title: "Projects",
        url: PATHS.messages.root,
      },
      {
        title: "Tasks",
        url: PATHS.messages.root,
      },
    ],
  },
  {
    title: "Streams",
    url: PATHS.messages.root,
    icon: Layers3,
    items: [
      {
        title: "Product",
        url: PATHS.messages.root,
      },
      {
        title: "Operations",
        url: PATHS.messages.root,
      },
    ],
  },
  {
    title: "Settings",
    url: PATHS.messages.root,
    icon: Settings2,
    items: [
      {
        title: "Organization",
        url: PATHS.messages.root,
      },
      {
        title: "Members",
        url: PATHS.messages.root,
      },
      {
        title: "Preferences",
        url: PATHS.messages.root,
      },
    ],
  },
]
