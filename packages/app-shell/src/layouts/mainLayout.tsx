import { useCallback } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@flow/ui/components/breadcrumb"
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

export function MainLayout() {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const location = useLocation()
  const isDesktop = isDesktopPlatform()

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
          Flow Desktop
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
