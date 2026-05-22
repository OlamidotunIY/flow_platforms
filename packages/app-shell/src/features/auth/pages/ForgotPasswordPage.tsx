import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flow/ui/components/card"

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Password reset flow will live here.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Better Auth is configured; connect this page to the reset endpoint when email templates are ready.
      </CardContent>
    </Card>
  )
}
