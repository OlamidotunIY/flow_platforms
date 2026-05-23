import { Outlet } from "react-router-dom"
import { useEffect } from "react"

import { isDesktopPlatform } from "../config"

export function AuthLayout() {
  const isDesktop = isDesktopPlatform()
  useEffect(() => {
    if (!isDesktop) {
      return
    }

    document.documentElement.classList.add("flow-transparent-window")

    return () => {
      document.documentElement.classList.remove("flow-transparent-window")
    }
  }, [isDesktop])

  if (isDesktop) {
    return (
      <main className="h-svh max-h-svh w-screen overflow-hidden bg-transparent text-foreground">
        <div className="h-full w-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-8 text-foreground">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </main>
  )
}
