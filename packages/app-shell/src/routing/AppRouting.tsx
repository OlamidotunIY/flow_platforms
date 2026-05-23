import { useEffect } from "react"
import {
  RouterProvider,
  Route,
  Routes,
  Navigate,
  BrowserRouter,
} from "react-router-dom"
import { Card, CardContent } from "@flow/ui/components/card"
import { LoaderBody } from "@flow/ui/components/screen-loader"
import { WindowControls } from "@flow/ui/components/window-controls"

import { getFlowAuthClient } from "../auth"
import {
  getDesktopWindowControls,
  getDesktopWindowKind,
  isDesktopPlatform,
} from "../config"
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "../features/auth"
import { AuthLayout } from "../layouts/AuthLayout"
import { router } from "./router"
import { PATHS } from "./paths"

function DesktopLoadingWindow() {
  const authClient = getFlowAuthClient()
  const session = authClient.useSession()
  const windowControls = getDesktopWindowControls()

  useEffect(() => {
    document.documentElement.classList.add("flow-transparent-window")

    return () => {
      document.documentElement.classList.remove("flow-transparent-window")
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void windowControls?.openAuth()
    }, 10000)

    if (session.isPending) {
      return () => window.clearTimeout(timeout)
    }

    window.clearTimeout(timeout)

    if (session.data) {
      void windowControls?.openApp()
    } else {
      void windowControls?.openAuth()
    }
  }, [session.data, session.isPending, windowControls])

  return (
    <main className="grid min-h-svh place-items-center overflow-hidden bg-transparent p-2 text-foreground">
      <Card className="relative w-full max-w-[440px] py-0 [-webkit-app-region:drag]">
        <div className="absolute top-2 right-2 [-webkit-app-region:no-drag]">
          <WindowControls
            onClose={windowControls?.close}
            onMinimize={windowControls?.minimize}
            showMaximize={false}
          />
        </div>
        <CardContent className="flex h-56 items-center justify-center px-6 pt-10">
          <LoaderBody label="Starting Flow..." />
        </CardContent>
      </Card>
    </main>
  )
}

function DesktopAuthWindow() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route index element={<Navigate to={PATHS.auth.login} replace />} />
          <Route path={PATHS.auth.login} element={<LoginPage />} />
          <Route path={PATHS.auth.signup} element={<SignUpPage />} />
          <Route
            path={PATHS.auth.forgotPassword}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={PATHS.auth.resetPassword}
            element={<ResetPasswordPage />}
          />
          <Route
            path="*"
            element={<Navigate to={PATHS.auth.login} replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const AppRouting = () => {
  if (isDesktopPlatform()) {
    const windowKind = getDesktopWindowKind()

    if (windowKind === "loading") {
      return <DesktopLoadingWindow />
    }

    if (windowKind === "auth") {
      return <DesktopAuthWindow />
    }
  }

  return <RouterProvider router={router} />
}

export { AppRouting }
