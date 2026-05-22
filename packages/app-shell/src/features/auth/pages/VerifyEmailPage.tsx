import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flow/ui/components/card"

export default function VerifyEmailPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify email</CardTitle>
          <CardDescription>We are checking your verification link.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Verification flow placeholder.</CardContent>
      </Card>
    </main>
  )
}
