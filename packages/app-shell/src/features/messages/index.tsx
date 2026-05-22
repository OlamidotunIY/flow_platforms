import { Card, CardContent, CardHeader, CardTitle } from "@flow/ui/components/card"

export function MessagesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Shared messages feature routes will live here.</CardContent>
    </Card>
  )
}
