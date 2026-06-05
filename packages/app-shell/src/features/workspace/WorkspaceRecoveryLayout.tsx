import { NavLink, Outlet } from "react-router-dom"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@flow/ui/components/button"
import { workspaceSetupControllerRetryV1 } from "@flow/api"

import { PATHS } from "../../routing/paths"

const workspaceRecoveryNav = [
  { label: "Create", to: PATHS.workspace.create },
  { label: "Department", to: PATHS.workspace.department },
  { label: "Teams", to: PATHS.workspace.teams },
  { label: "Plans", to: PATHS.workspace.plans },
  { label: "Members", to: PATHS.workspace.members },
]

export function WorkspaceRecoveryLayout() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div className="flex max-w-3xl gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Workspace recovery
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold">
                Finish workspace setup manually
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Automatic setup did not complete. These recovery pages are only
                available while setup is failed.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              void workspaceSetupControllerRetryV1()
            }}
            type="button"
            variant="outline"
          >
            <RefreshCw />
            Retry automatic setup
          </Button>
        </header>

        <nav className="flex flex-wrap gap-2 border-b pb-3">
          {workspaceRecoveryNav.map((item) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </main>
  )
}
