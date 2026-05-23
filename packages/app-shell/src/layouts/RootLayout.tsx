import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { usersControllerGetUserInfoV1 } from "@flow/api"

import { getFlowAuthClient } from "../auth"
import { type FlowUserInfo, useUserStore } from "../store/userStore"

function isFlowUserInfo(value: unknown): value is FlowUserInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    typeof (value as { user?: unknown }).user === "object"
  )
}

export default function RootLayout() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const clearUser = useUserStore((state) => state.clearUser)
  const setUser = useUserStore((state) => state.setUser)
  const setUserInfo = useUserStore((state) => state.setUserInfo)
  const setUserInfoStatus = useUserStore((state) => state.setUserInfoStatus)

  useEffect(() => {
    setUser(session.data?.user ?? null)
  }, [session.data?.user, setUser])

  useEffect(() => {
    let ignore = false

    if (session.isPending) {
      return
    }

    if (!session.data) {
      clearUser()
      return
    }

    setUserInfoStatus("loading")

    usersControllerGetUserInfoV1()
      .then((result) => {
        if (ignore) {
          return
        }

        if (result.error || !isFlowUserInfo(result.data)) {
          setUserInfoStatus("error")
          return
        }

        setUserInfo(result.data)
      })
      .catch(() => {
        if (!ignore) {
          setUserInfoStatus("error")
        }
      })

    return () => {
      ignore = true
    }
  }, [
    clearUser,
    session.data,
    session.isPending,
    setUserInfo,
    setUserInfoStatus,
  ])

  return <Outlet />
}
