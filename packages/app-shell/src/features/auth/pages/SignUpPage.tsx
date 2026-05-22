import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@flow/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flow/ui/components/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@flow/ui/components/field"
import { Input } from "@flow/ui/components/input"
import { WindowControls } from "@flow/ui/components/window-controls"
import { cn } from "@flow/ui/lib/utils"

import { getFlowAuthClient } from "../../../auth"
import { getDesktopWindowControls, isDesktopPlatform } from "../../../config"
import { PATHS } from "../../../routing/paths"

export default function SignUpPage() {
  const authClient = getFlowAuthClient()
  const windowControls = getDesktopWindowControls()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await authClient.signUp.email({ email, name, password })

    if (result.error) {
      setError(result.error.message ?? "Unable to create account.")
      return
    }

    if (isDesktopPlatform()) {
      await windowControls?.openApp()
      return
    }

    navigate(PATHS.root, { replace: true })
  }

  const isDesktop = isDesktopPlatform()

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-card shadow-2xl",
        isDesktop &&
          "rounded-lg border-border py-0 shadow-[0_24px_80px_rgba(0,0,0,0.55)] [-webkit-app-region:drag]"
      )}
    >
      {isDesktop ? (
        <div className="absolute right-2 top-2 [-webkit-app-region:no-drag]">
          <WindowControls
            onClose={windowControls?.close}
            onMinimize={windowControls?.minimize}
            showMaximize={false}
          />
        </div>
      ) : null}
      <CardHeader className={cn("text-center", isDesktop && "pt-8")}>
        <CardTitle className="text-xl">Create account</CardTitle>
        <CardDescription>Start using Flow across all your platforms.</CardDescription>
      </CardHeader>
      <CardContent className={cn(isDesktop && "[-webkit-app-region:no-drag]")}>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input id="signup-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input id="signup-password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </Field>
            {error ? <FieldDescription className="text-destructive">{error}</FieldDescription> : null}
            <Button type="submit">Sign up</Button>
            <FieldDescription className="text-center">
              Already have an account? <Link to={PATHS.auth.login}>Login</Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
