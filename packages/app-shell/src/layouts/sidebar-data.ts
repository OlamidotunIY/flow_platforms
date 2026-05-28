import type { LucideIcon } from "lucide-react"
import {
  Blocks,
  Calendar,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"

import { PATHS } from "../routing/paths"

export type SidebarProject = {
  id: string
  name: string
  url: string
  icon: LucideIcon
}

export type SidebarProjectGroup = {
  id: string
  name: string
  projects: SidebarProject[]
  teamId?: string | null
}

export const sidebarNavMain = [
  {
    title: "Search",
    url: PATHS.app.search,
    icon: Search,
  },
  {
    title: "Ask AI",
    url: PATHS.app.askAi,
    icon: Sparkles,
  },
  {
    title: "Home",
    url: PATHS.root,
    icon: Home,
    isActive: true,
  },
  {
    title: "Inbox",
    url: PATHS.app.inbox,
    icon: Inbox,
    badge: "10",
  },
]

export const sidebarNavSecondary = [
  {
    title: "Calendar",
    url: PATHS.app.calendar,
    icon: Calendar,
  },
  {
    title: "Settings",
    url: PATHS.app.settings,
    icon: Settings2,
  },
  {
    title: "Templates",
    url: PATHS.app.templates,
    icon: Blocks,
  },
  {
    title: "Trash",
    url: PATHS.app.trash,
    icon: Trash2,
  },
  {
    title: "Help",
    url: PATHS.app.help,
    icon: MessageCircleQuestion,
  },
]
