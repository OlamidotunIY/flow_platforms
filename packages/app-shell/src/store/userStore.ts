import { create } from "zustand"

import type { FlowAuthClient } from "../auth"

type AuthSession = ReturnType<FlowAuthClient["useSession"]>["data"]
export type FlowUser = NonNullable<AuthSession>["user"]

export type FlowProjectSummary = {
  id: string
  name: string
  url: string
  icon?: string | null
}

export type FlowDepartmentSummary = {
  id: string
  name: string
  slug?: string | null
  projects: FlowProjectSummary[]
}

export type FlowOrganizationSummary = {
  id: string
  name: string
  slug?: string | null
  logo?: string | null
  plan?: string | null
  activeDepartment: FlowDepartmentSummary | null
}

export type FlowUserInfo = {
  user: FlowUser
  activeOrganization: FlowOrganizationSummary | null
  organizations?: FlowOrganizationSummary[]
}

type UserInfoStatus = "idle" | "loading" | "success" | "error"

type UserState = {
  user: FlowUser | null
  userInfo: FlowUserInfo | null
  userInfoStatus: UserInfoStatus
  setUser: (user: FlowUser | null) => void
  setUserInfo: (userInfo: FlowUserInfo | null) => void
  setUserInfoStatus: (status: UserInfoStatus) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  userInfo: null,
  userInfoStatus: "idle",
  setUser: (user) => set({ user }),
  setUserInfo: (userInfo) =>
    set({
      userInfo,
      user: userInfo?.user ?? null,
      userInfoStatus: userInfo ? "success" : "idle",
    }),
  setUserInfoStatus: (userInfoStatus) => set({ userInfoStatus }),
  clearUser: () =>
    set({ user: null, userInfo: null, userInfoStatus: "idle" }),
}))
