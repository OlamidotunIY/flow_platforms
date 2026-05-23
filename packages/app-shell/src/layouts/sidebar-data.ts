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

export const sidebarNavMain = [
  {
    title: "Search",
    url: PATHS.messages.root,
    icon: Search,
  },
  {
    title: "Ask AI",
    url: PATHS.messages.root,
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
    url: PATHS.messages.root,
    icon: Inbox,
    badge: "10",
  },
]

export const sidebarNavSecondary = [
  {
    title: "Calendar",
    url: PATHS.messages.root,
    icon: Calendar,
  },
  {
    title: "Settings",
    url: PATHS.messages.root,
    icon: Settings2,
  },
  {
    title: "Templates",
    url: PATHS.messages.root,
    icon: Blocks,
  },
  {
    title: "Trash",
    url: PATHS.messages.root,
    icon: Trash2,
  },
  {
    title: "Help",
    url: PATHS.messages.root,
    icon: MessageCircleQuestion,
  },
]
