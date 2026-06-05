import { create } from "zustand"
import type {
  FlowAuthClient,
  UserProfileResponseDto,
  WorkspaceSidebarDepartmentDto,
  WorkspaceSidebarMeetingDto,
  WorkspaceSidebarRecentAiChatDto,
  WorkspaceSidebarResponseDto,
  WorkspaceSidebarRoomDto,
  WorkspaceSidebarTeamDto,
} from "@flow/api"

type AuthSession = ReturnType<FlowAuthClient["useSession"]>["data"]
type FlowSessionUser = NonNullable<AuthSession>["user"]
export type FlowUser = FlowSessionUser | UserProfileResponseDto
export type WorkspaceContext = WorkspaceSidebarResponseDto
export type WorkspaceSidebarTab = WorkspaceContext["activeTab"]
export type WorkspaceSidebarDepartment = WorkspaceSidebarDepartmentDto
export type WorkspaceSidebarTeam = WorkspaceSidebarTeamDto
export type WorkspaceSidebarRoom = WorkspaceSidebarRoomDto
export type WorkspaceSidebarRecentAiChat = WorkspaceSidebarRecentAiChatDto
export type WorkspaceSidebarMeeting = WorkspaceSidebarMeetingDto

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
