import { create } from "zustand"
import type {
  DepartmentEntity,
  OrganizationEntity,
  ProjectEntity,
  UserEntity,
} from "@flow/api"

import type { FlowAuthClient } from "../auth"

type AuthSession = ReturnType<FlowAuthClient["useSession"]>["data"]
type FlowSessionUser = NonNullable<AuthSession>["user"]
export type FlowUser = FlowSessionUser | UserEntity

export type FlowProjectSummary = Pick<ProjectEntity, "icon" | "id" | "name"> & {
  url?: string
}

export type FlowDepartmentSummary = Pick<
  DepartmentEntity,
  "color" | "description" | "id" | "name" | "organizationId"
> & {
  projects: FlowProjectSummary[]
}

export type FlowOrganizationSummary = Pick<
  OrganizationEntity,
  "id" | "logoUrl" | "name" | "slug"
> & {
  activeDepartment: FlowDepartmentSummary | null
  departments?: FlowDepartmentSummary[]
}

export type FlowUserInfo = {
  user: UserEntity
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
