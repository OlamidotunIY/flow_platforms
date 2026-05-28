import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { FileSearch, Search } from "lucide-react"
import {
  searchControllerSearchV1,
  type OrganizationSearchResponseDto,
} from "@flow/api"
import { Badge } from "@flow/ui/components/badge"
import { Button } from "@flow/ui/components/button"
import { Input } from "@flow/ui/components/input"
import { EmptyState, PageError, PageFrame, SearchSkeleton } from "../../components/page-state"

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback
}

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [data, setData] = useState<OrganizationSearchResponseDto | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  function runSearch(nextQuery: string) {
    setStatus("loading")
    searchControllerSearchV1({ query: { q: nextQuery } }).then((result) => {
      if (result.error || !result.data) {
        setStatus("error")
        return
      }

      setData(result.data)
      setStatus("ready")
    })
  }

  useEffect(() => {
    runSearch("")
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    runSearch(query)
  }

  if (status === "loading" && !data) {
    return <SearchSkeleton />
  }

  if (status === "error" && !data) {
    return <PageError onRetry={() => runSearch(query)} title="Search unavailable" />
  }

  return (
    <PageFrame
      description="Search every visible project, task, department, team, chat, and template in the active organization."
      eyebrow="Universal finder"
      title="Organization search"
    >
      <form
        className="flex gap-2 rounded-2xl border bg-card/85 p-3 shadow-sm backdrop-blur"
        onSubmit={submit}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-12 rounded-xl bg-background/70 pl-11 text-base"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, tasks, departments, teams, chats, templates..."
            value={query}
          />
        </div>
        <Button className="h-12 rounded-xl px-5" type="submit">
          Search
        </Button>
      </form>

      <section className="overflow-hidden rounded-2xl border bg-card/85 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b bg-muted/20 p-5">
          <div>
            <h2 className="font-heading text-xl font-medium">Results</h2>
            <p className="text-sm text-muted-foreground">
              {data?.results.length ?? 0} matches
            </p>
          </div>
          <FileSearch className="size-5 text-primary" />
        </div>
        {data?.results.length ? (
          <div className="divide-y">
            {data.results.map((result) => {
              const content = (
                <div className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium">{textValue(result.title, "Untitled result")}</h3>
                      <Badge variant="outline">{result.type}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {textValue(result.description ?? result.context, "No description")}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {textValue(result.context)}
                  </div>
                </div>
              )

              return result.url ? (
                <Link key={`${result.type}-${result.id}`} to={result.url}>
                  {content}
                </Link>
              ) : (
                <div key={`${result.type}-${result.id}`}>{content}</div>
              )
            })}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              description="Try a project name, channel, teammate, task keyword, or template category."
              title="No results yet"
            />
          </div>
        )}
      </section>
    </PageFrame>
  )
}
