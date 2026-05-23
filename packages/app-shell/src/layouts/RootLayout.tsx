import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { getFlowAuthClient } from "../auth"
import { useUserStore } from "../store/userStore"

export default function RootLayout() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const clearUser = useUserStore((state) => state.clearUser)
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    if (session.isPending) {
      return
    }

    if (!session.data) {
      clearUser()
      return
    }

    setUser(session.data.user)
  }, [clearUser, session.data, session.isPending, setUser])

  return <Outlet />
}
