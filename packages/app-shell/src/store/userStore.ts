import { create } from "zustand"
import type { UserProfileResponseDto, UsersMeResponseDto } from "@flow/api"

import type { FlowAuthClient } from "../auth"

type AuthSession = ReturnType<FlowAuthClient["useSession"]>["data"]
type FlowSessionUser = NonNullable<AuthSession>["user"]
export type FlowUser = FlowSessionUser | UserProfileResponseDto
export type FlowUserInfo = UsersMeResponseDto

type UserInfoStatus = "idle" | "loading" | "success" | "error"

type UserState = {
  user: FlowUser | null
  userInfo: FlowUserInfo | null
  userInfoStatus: UserInfoStatus
  workspaceSetupStatus: FlowUserInfo["workspaceSetupStatus"] | null
  setUser: (user: FlowUser | null) => void
  setUserInfo: (userInfo: FlowUserInfo | null) => void
  replaceUserInfoFromSetup: (userInfo: FlowUserInfo) => void
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
  replaceUserInfoFromSetup: (userInfo) =>
    set({
      userInfo,
      user: userInfo.user,
      userInfoStatus: "success",
      workspaceSetupStatus: userInfo.workspaceSetupStatus,
    }),
  setUserInfoStatus: (userInfoStatus) => set({ userInfoStatus }),
  clearUser: () =>
    set({
      user: null,
      userInfo: null,
      userInfoStatus: "idle",
      workspaceSetupStatus: null,
    }),
}))
