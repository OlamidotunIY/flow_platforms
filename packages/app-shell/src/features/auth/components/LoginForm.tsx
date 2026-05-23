import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@flow/ui/components/button"
import { Card, CardContent, CardHeader } from "@flow/ui/components/card"
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
import {
  AppleIcon,
  FlowLogo,
  getAuthErrorMessage,
  GoogleIcon,
  isAppleDevice,
  LoadingButtonContent,
  logAuthRequestError,
  type AuthStep,
} from "./AuthFormParts"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [step, setStep] = React.useState<AuthStep>("email")
  const [error, setError] = React.useState<string>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [socialProvider, setSocialProvider] = React.useState<
    "apple" | "google"
  >()
  const showApple = isAppleDevice()
  const isBusy = isSubmitting || Boolean(socialProvider)

  async function signInWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)

    if (step === "email") {
      setStep("password")
      return
    }

    try {
      setIsSubmitting(true)

      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      })

      if (result.error) {
        setError(result.error.message ?? "Unable to sign in.")
        return
      }

      if (isDesktopPlatform()) {
        await windowControls?.openApp()
        return
      }

      navigate(PATHS.root, { replace: true })
    } catch (requestError) {
      logAuthRequestError({
        action: "sign-in with email",
        path: "/sign-in/email",
        error: requestError,
      })
      setError(getAuthErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function signInWithProvider(provider: "apple" | "google") {
    try {
      setError(undefined)
      setSocialProvider(provider)
      await authClient.signIn.social({ provider })
    } catch (requestError) {
      logAuthRequestError({
        action: `sign-in with ${provider}`,
        path: "/sign-in/social",
        error: requestError,
      })
      setError(getAuthErrorMessage(requestError))
    } finally {
      setSocialProvider(undefined)
    }
  }

  const isDesktop = isDesktopPlatform()
  const title = step === "email" ? "Continue" : "Login"

  return (
    <div
      className={cn("flex flex-col", isDesktop && "h-full", className)}
      {...props}
    >
      <Card
        className={cn(
          "relative overflow-hidden bg-card",
          isDesktop &&
            "flex h-full justify-center rounded-lg border-border py-0 [-webkit-app-region:drag]"
        )}
      >
        {isDesktop ? (
          <div className="absolute top-2.5 right-2.5 [-webkit-app-region:no-drag]">
            <WindowControls
              onClose={windowControls?.close}
              onMinimize={windowControls?.minimize}
              showMaximize={false}
            />
          </div>
        ) : null}
        <CardHeader
          className={cn("text-center", isDesktop && "px-7 pt-8 pb-4")}
        >
          <FlowLogo
            title="Welcome back"
            description="Sign in with your email or social account."
          />
        </CardHeader>
        <CardContent
          className={cn(isDesktop && "px-7 pb-0 [-webkit-app-region:no-drag]")}
        >
          <form onSubmit={signInWithEmail}>
            <FieldGroup className={cn(isDesktop && "gap-4")}>
              <Field className={cn(isDesktop && "gap-2.5")}>
                {showApple ? (
                  <Button
                    className={cn(isDesktop && "h-10 text-[0.8125rem]")}
                    variant="outline"
                    type="button"
                    disabled={isBusy}
                    onClick={() => signInWithProvider("apple")}
                  >
                    {socialProvider === "apple" ? null : <AppleIcon />}
                    <LoadingButtonContent
                      isLoading={socialProvider === "apple"}
                    >
                      Continue with Apple
                    </LoadingButtonContent>
                  </Button>
                ) : null}
                <Button
                  className={cn(isDesktop && "h-10 text-[0.8125rem]")}
                  variant="outline"
                  type="button"
                  disabled={isBusy}
                  onClick={() => signInWithProvider("google")}
                >
                  {socialProvider === "google" ? null : <GoogleIcon />}
                  <LoadingButtonContent isLoading={socialProvider === "google"}>
                    Continue with Google
                  </LoadingButtonContent>
                </Button>
              </Field>
              <FieldSeparator
                className={cn(
                  "*:data-[slot=field-separator-content]:bg-card",
                  isDesktop &&
                    "py-0 *:data-[slot=field-separator-content]:text-[0.6875rem]"
                )}
              >
                Or continue with
              </FieldSeparator>
              {step === "email" ? (
                <Field className={cn(isDesktop && "gap-2")}>
                  <FieldLabel
                    className={cn(isDesktop && "text-[0.8125rem]")}
                    htmlFor="email"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    disabled={isBusy}
                    onChange={(event) => setEmail(event.target.value)}
                    className={cn(
                      isDesktop && "h-10 rounded-lg px-3 text-[0.875rem]"
                    )}
                  />
                </Field>
              ) : (
                <Field className={cn(isDesktop && "gap-2")}>
                  <div className="flex items-center">
                    <FieldLabel
                      className={cn(isDesktop && "text-[0.8125rem]")}
                      htmlFor="password"
                    >
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
                    autoFocus
                    value={password}
                    disabled={isBusy}
                    onChange={(event) => setPassword(event.target.value)}
                    className={cn(
                      isDesktop && "h-10 rounded-lg px-3 text-[0.875rem]"
                    )}
                  />
                  <button
                    className="w-fit text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    type="button"
                    onClick={() => {
                      setPassword("")
                      setStep("email")
                    }}
                  >
                    Use a different email
                  </button>
                </Field>
              )}
              {error ? (
                <Field>
                  <FieldDescription className="text-destructive">
                    {error}
                  </FieldDescription>
                </Field>
              ) : null}
              <Field>
                <Button
                  className={cn(isDesktop && "h-10 text-[0.8125rem]")}
                  type="submit"
                  disabled={isBusy}
                >
                  <LoadingButtonContent isLoading={isSubmitting}>
                    {isSubmitting ? "Logging in..." : title}
                  </LoadingButtonContent>
                </Button>
                <FieldDescription
                  className={cn("text-center", isDesktop && "text-xs")}
                >
                  Don&apos;t have an account?{" "}
                  <Link to={PATHS.auth.signup}>Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          <FieldDescription
            className={cn(
              "mt-4 text-center",
              isDesktop && "mt-3 text-[0.6875rem] leading-4"
            )}
          >
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  )
}
