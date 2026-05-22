import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flow/ui/components/card"

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter a new password from your reset link.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Reset password form placeholder.</CardContent>
    </Card>
  )
}
