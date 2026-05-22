import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@flow/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flow/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@flow/ui/components/field"
import { Input } from "@flow/ui/components/input"
import { WindowControls } from "@flow/ui/components/window-controls"
import { cn } from "@flow/ui/lib/utils"

import { getFlowAuthClient } from "../../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../../config"
import { PATHS } from "../../../routing/paths"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function signInWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)

    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error.message ?? "Unable to sign in.")
      return
    }

    if (isDesktopPlatform()) {
      await windowControls?.openApp()
      return
    }

    navigate(PATHS.root, { replace: true })
  }

  async function signInWithProvider(provider: "apple" | "google") {
    await authClient.signIn.social({ provider })
  }

  const isDesktop = isDesktopPlatform()

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card
        className={cn(
          "relative overflow-hidden bg-card shadow-2xl",
          isDesktop &&
            "rounded-lg border-border py-0 shadow-[0_24px_80px_rgba(0,0,0,0.55)] [-webkit-app-region:drag]"
        )}
      >
        {isDesktop ? (
          <div className="absolute right-2.5 top-2.5 [-webkit-app-region:no-drag]">
            <WindowControls
              onClose={windowControls?.close}
              onMinimize={windowControls?.minimize}
              showMaximize={false}
            />
          </div>
        ) : null}
        <CardHeader
          className={cn(
            "text-center",
            isDesktop && "gap-1 px-6 pb-4 pt-8 text-left"
          )}
        >
          <CardTitle className={cn("text-xl", isDesktop && "text-base leading-6")}>
            Welcome back
          </CardTitle>
          <CardDescription className={cn(isDesktop && "text-xs leading-5")}>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(isDesktop && "px-6 pb-5 [-webkit-app-region:no-drag]")}>
          <form onSubmit={signInWithEmail}>
            <FieldGroup className={cn(isDesktop && "gap-3.5")}>
              <Field className={cn(isDesktop && "gap-2")}>
                <Button
                  className={cn(isDesktop && "h-9 text-[0.8125rem]")}
                  variant="outline"
                  type="button"
                  onClick={() => signInWithProvider("apple")}
                >
                  Login with Apple
                </Button>
                <Button
                  className={cn(isDesktop && "h-9 text-[0.8125rem]")}
                  variant="outline"
                  type="button"
                  onClick={() => signInWithProvider("google")}
                >
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator
                className={cn(
                  "*:data-[slot=field-separator-content]:bg-card",
                  isDesktop && "py-0 *:data-[slot=field-separator-content]:text-[0.6875rem]"
                )}
              >
                Or continue with
              </FieldSeparator>
              <Field className={cn(isDesktop && "gap-1.5")}>
                <FieldLabel className={cn(isDesktop && "text-[0.8125rem]")} htmlFor="email">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={cn(isDesktop && "h-9 rounded-md px-3 text-[0.8125rem]")}
                />
              </Field>
              <Field className={cn(isDesktop && "gap-1.5")}>
                <div className="flex items-center">
                  <FieldLabel className={cn(isDesktop && "text-[0.8125rem]")} htmlFor="password">
                    Password
                  </FieldLabel>
                  <Link
                    to={PATHS.auth.forgotPassword}
                    className={cn(
                      "ml-auto underline-offset-4 hover:underline",
                      isDesktop ? "text-xs" : "text-sm"
                    )}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={cn(isDesktop && "h-9 rounded-md px-3 text-[0.8125rem]")}
                />
              </Field>
              {error ? (
                <Field>
                  <FieldDescription className="text-destructive">
                    {error}
                  </FieldDescription>
                </Field>
              ) : null}
              <Field>
                <Button
                  className={cn(isDesktop && "h-9 text-[0.8125rem]")}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className={cn("text-center", isDesktop && "text-xs")}>
                  Don&apos;t have an account?{" "}
                  <Link to={PATHS.auth.signup}>Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          <FieldDescription className={cn("mt-4 text-center", isDesktop && "mt-3 text-[0.6875rem] leading-4")}>
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
