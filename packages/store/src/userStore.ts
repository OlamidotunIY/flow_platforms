import { create } from "zustand"
import type {
  FlowAuthClient,
  OrganizationSummaryResponseDto,
  PageSummaryResponseDto,
  TeamSummaryResponseDto,
  UserProfileResponseDto,
} from "@flow/api"

type AuthSession = ReturnType<FlowAuthClient["useSession"]>["data"]
type FlowSessionUser = NonNullable<AuthSession>["user"]
export type FlowUser = FlowSessionUser | UserProfileResponseDto
export type WorkspaceSidebarTab = "home" | "inbox" | "message" | "meeting"

export type WorkspaceSidebarDepartment = {
  id: string
  organizationId: string
  name: string
  description?: unknown
  color?: unknown
  createdAt: string
  updatedAt: string
  pages: PageSummaryResponseDto[]
}

export type WorkspaceSidebarTeam = Omit<
  TeamSummaryResponseDto,
  "departmentId"
> & {
  departmentId?: string | null
  pages?: PageSummaryResponseDto[]
}

export type WorkspaceSidebarRoom = {
  id: string
  type: string
  name: string
  description?: string | null
  context?: string | null
  updatedAt: string
  memberCount: number
  lastMessage?: {
    id: string
    content?: string | null
    createdAt: string
    senderName?: string | null
  } | null
}

export type WorkspaceSidebarRecentAiChat = {
  id: string
  title: string
  preview?: string | null
  updatedAt: string
}

export type WorkspaceSidebarMeeting = {
  id: string
  title: string
  status: string
  startsAt?: string | null
  endsAt?: string | null
  location?: string | null
  departmentName?: string | null
  teamName?: string | null
  projectName?: string | null
}

export type WorkspaceContext = {
  workspaceSetupStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  activeTab: WorkspaceSidebarTab
  organizations: OrganizationSummaryResponseDto[]
  activeOrganization:
    | (OrganizationSummaryResponseDto & {
        member?: unknown
        departments: WorkspaceSidebarDepartment[]
        teams: WorkspaceSidebarTeam[]
        pages: PageSummaryResponseDto[]
        customFields: Record<string, unknown[]>
        activeDepartment: WorkspaceSidebarDepartment | null
        activeTeam?: WorkspaceSidebarTeam | null
      })
    | null
  home: {
    view: "WORKSPACE" | "DEPARTMENT"
    defaultPage: PageSummaryResponseDto | null
  }
  inbox?: {
    channels: WorkspaceSidebarRoom[]
    directMessages: WorkspaceSidebarRoom[]
  } | null
  message?: {
    recentChats: WorkspaceSidebarRecentAiChat[]
  } | null
  meeting?: {
    upcomingMeetings: WorkspaceSidebarMeeting[]
  } | null
}

export type FlowUserInfo = WorkspaceContext & {
  user: FlowUser
}

type UserInfoStatus = "idle" | "loading" | "success" | "error"

type UserState = {
  user: FlowUser | null
  userInfo: FlowUserInfo | null
  userInfoStatus: UserInfoStatus
  workspaceSetupStatus: FlowUserInfo["workspaceSetupStatus"] | null
  setUser: (user: FlowUser | null) => void
  setUserInfo: (userInfo: FlowUserInfo | null) => void
  setWorkspaceContext: (context: WorkspaceContext | null) => void
  replaceUserInfoFromSetup: (context: WorkspaceContext) => void
  setUserInfoStatus: (status: UserInfoStatus) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  userInfo: null,
  userInfoStatus: "idle",
  workspaceSetupStatus: null,
  setUser: (user) => set({ user }),
  setUserInfo: (userInfo) =>
    set({
      userInfo,
      user: userInfo?.user ?? null,
      userInfoStatus: userInfo ? "success" : "idle",
      workspaceSetupStatus: userInfo?.workspaceSetupStatus ?? null,
    }),
  setWorkspaceContext: (context) =>
    set((state) => {
      if (!context) {
        return {
          userInfo: null,
          userInfoStatus: state.user ? "idle" : "idle",
          workspaceSetupStatus: null,
        }
      }

      if (!state.user) {
        return {
          userInfo: null,
          userInfoStatus: "error",
          workspaceSetupStatus: context.workspaceSetupStatus,
        }
      }

      return {
        userInfo: {
          ...context,
          user: state.user,
        },
        userInfoStatus: "success",
        workspaceSetupStatus: context.workspaceSetupStatus,
      }
    }),
  replaceUserInfoFromSetup: (context) =>
    set((state) => ({
      userInfo: state.user
        ? {
            ...context,
            user: state.user,
          }
        : null,
      userInfoStatus: state.user ? "success" : "idle",
      workspaceSetupStatus: context.workspaceSetupStatus,
    })),
  setUserInfoStatus: (userInfoStatus) => set({ userInfoStatus }),
  clearUser: () =>
    set({
      user: null,
      userInfo: null,
      userInfoStatus: "idle",
      workspaceSetupStatus: null,
    }),
}))
