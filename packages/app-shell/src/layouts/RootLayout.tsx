import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { getFlowAuthClient } from "../auth"
import { useUserStore } from "../store/userStore"

export default function RootLayout() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    setUser(session.data?.user ?? null)
  }, [session.data?.user, setUser])

  return <Outlet />
}
