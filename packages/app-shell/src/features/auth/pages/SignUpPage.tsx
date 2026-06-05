import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@flow/ui/components/button"
import { Card, CardContent, CardHeader } from "@flow/ui/components/card"
import
{
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@flow/ui/components/field"
import { Input } from "@flow/ui/components/input"
import { WindowControls } from "@flow/ui/components/window-controls"
import { cn } from "@flow/ui/lib/utils"

import { getFlowAuthClient } from "@flow/api"
import { getDesktopWindowControls, isDesktopPlatform } from "../../../util/config"
import { PATHS } from "../../../routing/paths"
import
{
  AppleIcon,
  FlowLogo,
  getAuthErrorMessage,
  GoogleIcon,
  isAppleDevice,
  LoadingButtonContent,
  logAuthRequestError,
  type AuthStep,
} from "../components/AuthFormParts"

function nameFromEmail(email: string)
{
  return email.split("@")[0]?.trim() || email
}

export default function SignUpPage()
{
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
  const isDesktop = isDesktopPlatform()
  const showApple = isAppleDevice()
  const isBusy = isSubmitting || Boolean(socialProvider)

  async function signUpWithEmail(event: React.FormEvent<HTMLFormElement>)
  {
    event.preventDefault()
    setError(undefined)

    if (step === "email")
    {
      setStep("password")
      return
    }

    try
    {
      setIsSubmitting(true)

      const result = await authClient.signUp.email({
        email,
        name: nameFromEmail(email),
        password,
      })

      if (result.error)
      {
        setError(result.error.message ?? "Unable to create account.")
        return
      }

      if (isDesktopPlatform())
      {
        await windowControls?.openApp()
        return
      }

      navigate(PATHS.root, { replace: true })
    } catch (requestError)
    {
      logAuthRequestError({
        action: "sign-up with email",
        path: "/sign-up/email",
        error: requestError,
      })
      setError(getAuthErrorMessage(requestError))
    } finally
    {
      setIsSubmitting(false)
    }
  }

  async function signInWithProvider(provider: "apple" | "google")
  {
    try
    {
      setError(undefined)
      setSocialProvider(provider)
      await authClient.signIn.social({ provider })
    } catch (requestError)
    {
      logAuthRequestError({
        action: `sign-in with ${provider}`,
        path: "/sign-in/social",
        error: requestError,
      })
      setError(getAuthErrorMessage(requestError))
    } finally
    {
      setSocialProvider(undefined)
    }
  }

  const title = step === "email" ? "Continue" : "Create account"

  return (
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
      <CardHeader className={cn("text-center", isDesktop && "px-8 pt-10 pb-5")}>
        <FlowLogo
          title="Create account"
          description="Start with email or continue with a social account."
        />
      </CardHeader>
      <CardContent
        className={cn(isDesktop && "px-8 pb-0 [-webkit-app-region:no-drag]")}
      >
        <form onSubmit={signUpWithEmail}>
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
                  <LoadingButtonContent isLoading={socialProvider === "apple"}>
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
                  htmlFor="signup-email"
                >
                  Email
                </FieldLabel>
                <Input
                  id="signup-email"
                  required
                  type="email"
                  placeholder="m@example.com"
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
                <FieldLabel
                  className={cn(isDesktop && "text-[0.8125rem]")}
                  htmlFor="signup-password"
                >
                  Password
                </FieldLabel>
                <Input
                  id="signup-password"
                  required
                  autoFocus
                  type="password"
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
                  onClick={() =>
                  {
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
                  {isSubmitting ? "Creating account..." : title}
                </LoadingButtonContent>
              </Button>
              <FieldDescription
                className={cn("text-center", isDesktop && "text-xs")}
              >
                Already have an account?{" "}
                <Link to={PATHS.auth.login}>Login</Link>
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
  )
}
