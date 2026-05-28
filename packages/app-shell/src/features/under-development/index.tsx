import { Construction } from "lucide-react"

type UnderDevelopmentPageProps = {
  title: string
  description?: string
}

export function UnderDevelopmentPage({
  description = "This area is being built and will be available soon.",
  title,
}: UnderDevelopmentPageProps) {
  return (
    <section className="flex min-h-[calc(100svh-9rem)] items-center justify-center rounded-lg border bg-card/70 p-8 text-card-foreground shadow-sm">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Construction />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-xl font-medium">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </section>
  )
}
