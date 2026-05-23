import { useCallback, useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@flow/ui/components/breadcrumb"
import { Button } from "@flow/ui/components/button"
import { Separator } from "@flow/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@flow/ui/components/sidebar"
import { TooltipProvider } from "@flow/ui/components/tooltip"
import { WindowTitleBar } from "@flow/ui/components/window-controls"

import { clearFlowAuthState, getFlowAuthClient } from "../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../config"
import { PATHS } from "../routing/paths"
import { AppSidebar } from "./AppSidebar"

function getBreadcrumbPage(pathname: string) {
  if (pathname === PATHS.messages.root || pathname === PATHS.root) {
    return "Messages"
  }

  return "Workspace"
}

function getLocationKey(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`
}

export function MainLayout() {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = isDesktopPlatform()
  const [routeHistory, setRouteHistory] = useState(() => [
    getLocationKey(location),
  ])
  const [routeHistoryIndex, setRouteHistoryIndex] = useState(0)
  const navigationIntent = useRef<"back" | "forward" | null>(null)
  const currentLocationKey = getLocationKey(location)
  const canGoBack =
    routeHistoryIndex > 0 && currentLocationKey !== PATHS.root
  const canGoForward = routeHistoryIndex < routeHistory.length - 1

  useEffect(() => {
    const intent = navigationIntent.current
    navigationIntent.current = null

    if (intent) {
      return
    }

    setRouteHistory((history) => {
      if (history[routeHistoryIndex] === currentLocationKey) {
        return history
      }

      const nextHistory = history.slice(0, routeHistoryIndex + 1)
      nextHistory.push(currentLocationKey)
      setRouteHistoryIndex(nextHistory.length - 1)

      return nextHistory
    })
  }, [currentLocationKey, routeHistoryIndex])

  function goBack() {
    if (!canGoBack) {
      return
    }

    const nextIndex = routeHistoryIndex - 1
    navigationIntent.current = "back"
    setRouteHistoryIndex(nextIndex)
    navigate(routeHistory[nextIndex])
  }

  function goForward() {
    if (!canGoForward) {
      return
    }

    const nextIndex = routeHistoryIndex + 1
    navigationIntent.current = "forward"
    setRouteHistoryIndex(nextIndex)
    navigate(routeHistory[nextIndex])
  }

  const signOut = useCallback(async () => {
    await authClient.signOut()
    await clearFlowAuthState()

    if (isDesktopPlatform()) {
      await windowControls?.openAuth()
      return
    }

    window.location.assign(PATHS.auth.login)
  }, [authClient, windowControls])

  return (
    <div className="min-h-svh bg-background text-foreground">
      {isDesktop ? (
        <WindowTitleBar
          onClose={windowControls?.close}
          onMaximize={windowControls?.toggleMaximize}
          onMinimize={windowControls?.minimize}
        >
          <div className="flex items-center gap-1 [-webkit-app-region:no-drag]">
            <Button
              aria-label="Go back"
              className="[-webkit-app-region:no-drag]"
              disabled={!canGoBack}
              onClick={goBack}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <ArrowLeft />
            </Button>
            <Button
              aria-label="Go forward"
              className="[-webkit-app-region:no-drag]"
              disabled={!canGoForward}
              onClick={goForward}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <ArrowRight />
            </Button>
          </div>
        </WindowTitleBar>
      ) : null}
      <TooltipProvider>
        <SidebarProvider
          className={
            isDesktop ? "min-h-[calc(100svh-2.5rem)]" : undefined
          }
        >
          <AppSidebar
            className={
              isDesktop ? "top-10 h-[calc(100svh-2.5rem)]" : undefined
            }
            onSignOut={() => {
              void signOut()
            }}
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to={PATHS.root}>Flow</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {getBreadcrumbPage(location.pathname)}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}
