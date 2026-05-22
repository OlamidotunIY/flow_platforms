import { Link, Routes, Route } from "react-router-dom"
import { Button } from "@flow/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flow/ui/components/card"

function ErrorCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to="/">Go home</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function Error404Page() {
  return <ErrorCard title="Not found" description="That route does not exist." />
}

export function Error500Page() {
  return <ErrorCard title="Server error" description="Something went wrong." />
}

export function ErrorsRouting() {
  return (
    <Routes>
      <Route path="404" element={<Error404Page />} />
      <Route path="500" element={<Error500Page />} />
    </Routes>
  )
}
