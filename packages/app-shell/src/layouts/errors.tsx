import { Outlet } from "react-router-dom"

export function ErrorsLayout() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 text-foreground">
      <Outlet />
    </main>
  )
}
