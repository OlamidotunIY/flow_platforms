import { create } from "zustand"

import type { FlowAuthClient } from "../auth"

type AuthSession = ReturnType<FlowAuthClient["useSession"]>["data"]
export type FlowUser = NonNullable<AuthSession>["user"]

type UserState = {
  user: FlowUser | null
  setUser: (user: FlowUser | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
