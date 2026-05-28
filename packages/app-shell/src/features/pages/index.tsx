import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Navigate, useParams } from "react-router-dom"
import {
  Calendar,
  CheckSquare,
  Columns3,
  FileText,
  LayoutDashboard,
  List,
  Rows3,
  TimerReset,
} from "lucide-react"
import { pagesControllerGetPageV1, type PageSummaryResponseDto } from "@flow/api"
import { Badge } from "@flow/ui/components/badge"

import {
  CustomDataTable,
  type CustomFieldDefinition,
  type CustomFieldValue,
  type DataTableColumn,
} from "../../components/custom-data-table"
import {
  DashboardSkeleton,
  EmptyState,
  PageError,
  PageFrame,
} from "../../components/page-state"
import { PATHS } from "../../routing/paths"
import { useUserStore } from "../../store/userStore"

type DynamicPageResponse = {
  page: PageSummaryResponseDto
  views: Array<{
    id: string
    pageId: string
    name: string
    type: string
    isDefault?: boolean
  }>
  activeView: {
    id: string
    name: string
    type: string
    query?: { sourceType?: string }
    blocks?: Array<Record<string, unknown>>
  } | null
  data: unknown
}

type SourceRow = Record<string, unknown> & {
  id?: string
  customValues?: CustomFieldValue[]
}

const sourceLabels: Record<string, string> = {
  PROJECT: "Projects",
  TASK: "Tasks",
  SPRINT: "Sprints",
  DOC: "Docs",
  MEETING: "Meetings",
  TEAM: "Teams",
  DEPARTMENT: "Departments",
  TEMPLATE: "Templates",
}

function isPageResponse(value: unknown): value is DynamicPageResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      "page" in value &&
      "views" in value &&
      "activeView" in value
  )
}

function stringValue(value: unknown, fallback = "Untitled") {
  if (typeof value === "string" && value.trim()) return value
  if (typeof value === "number") return String(value)
  return fallback
}

function dateValue(value: unknown) {
  if (!value) return "Not set"
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function rowsFromData(data: unknown) {
  return Array.isArray(data) ? (data as SourceRow[]) : []
}

function sourceFromView(view: DynamicPageResponse["activeView"]) {
  return view?.query?.sourceType ?? "PROJECT"
}

function nativeColumns(sourceType: string): DataTableColumn<SourceRow>[] {
  const nameColumn: DataTableColumn<SourceRow> = {
    id: "name",
    header: sourceType === "TASK" ? "Task name" : "Name",
    icon: sourceType === "DOC" ? <FileText className="size-3.5" /> : <Rows3 className="size-3.5" />,
    accessor: (row) => row.name ?? row.title,
    render: (row) => (
      <span className="inline-flex min-w-0 items-center gap-2 font-medium">
        <span className="truncate">{stringValue(row.name ?? row.title)}</span>
      </span>
    ),
    width: "30%",
  }

  const statusColumn: DataTableColumn<SourceRow> = {
    id: "status",
    header: "Status",
    icon: <CheckSquare className="size-3.5" />,
    accessor: (row) => row.status,
    kind: "status",
    width: "14%",
  }

  if (sourceType === "MEETING") {
    return [
      nameColumn,
      statusColumn,
      {
        id: "startsAt",
        header: "Starts",
        icon: <Calendar className="size-3.5" />,
        accessor: (row) => dateValue(row.startsAt),
        width: "16%",
      },
      {
        id: "location",
        header: "Location",
        accessor: (row) => row.location,
        width: "16%",
      },
    ]
  }

  if (sourceType === "TASK") {
    return [
      nameColumn,
      statusColumn,
      {
        id: "type",
        header: "Type",
        accessor: (row) => row.type,
        width: "12%",
      },
      {
        id: "project",
        header: "Project",
        accessor: (row) => (row.project as { name?: string } | undefined)?.name,
        width: "18%",
      },
    ]
  }

  if (sourceType === "SPRINT") {
    return [
      nameColumn,
      statusColumn,
      {
        id: "dates",
        header: "Dates",
        icon: <TimerReset className="size-3.5" />,
        accessor: (row) => `${dateValue(row.startDate)} - ${dateValue(row.endDate)}`,
        width: "22%",
      },
    ]
  }

  return [
    nameColumn,
    statusColumn,
    {
      id: "updatedAt",
      header: "Updated",
      icon: <Calendar className="size-3.5" />,
      accessor: (row) => dateValue(row.updatedAt),
      width: "16%",
    },
  ]
}

function customFieldsForSource(userInfo: ReturnType<typeof useUserStore.getState>["userInfo"], sourceType: string) {
  const grouped = userInfo?.activeOrganization?.customFields
  if (!grouped || typeof grouped !== "object") return []
  const fields = (grouped as Record<string, unknown>)[sourceType]
  return Array.isArray(fields) ? (fields as CustomFieldDefinition[]) : []
}

function ViewBadge({ type }: { type: string }) {
  const icon: Record<string, ReactNode> = {
    TABLE: <Rows3 className="size-3.5" />,
    BOARD: <Columns3 className="size-3.5" />,
    LIST: <List className="size-3.5" />,
    TIMELINE: <TimerReset className="size-3.5" />,
    CALENDAR: <Calendar className="size-3.5" />,
    DASHBOARD: <LayoutDashboard className="size-3.5" />,
  }

  return (
    <Badge className="gap-1 rounded-md" variant="outline">
      {icon[type] ?? <Rows3 className="size-3.5" />}
      {type.toLowerCase()}
    </Badge>
  )
}

function DataView({
  data,
  sourceType,
  title,
  type,
}: {
  data: unknown
  sourceType: string
  title: string
  type: string
}) {
  const userInfo = useUserStore((state) => state.userInfo)
  const fields = customFieldsForSource(userInfo, sourceType)
  const rows = rowsFromData(data)

  if (type === "TABLE") {
    return (
      <CustomDataTable
        addLabel={`New ${title.toLowerCase().replace(/s$/, "")}`}
        columns={nativeColumns(sourceType)}
        customFields={fields}
        customValuesAccessor={(row) => row.customValues}
        rows={rows}
        title={title}
      />
    )
  }

  return (
    <section className="standalone-widget rounded-xl border bg-card/85 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {rows.length} records rendered from this saved {type.toLowerCase()} view.
          </p>
        </div>
        <ViewBadge type={type} />
      </div>
      {rows.length ? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row, index) => (
            <div className="rounded-lg border bg-background/45 p-3" key={String(row.id ?? index)}>
              <div className="truncate font-medium">{stringValue(row.name ?? row.title)}</div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stringValue(row.status, "No status")}</span>
                <span>{dateValue(row.updatedAt ?? row.startsAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Records matching this saved view will appear here."
          title="No records in this view"
        />
      )}
    </section>
  )
}

function DashboardView({ data }: { data: unknown }) {
  const blocks = Array.isArray((data as { blocks?: unknown[] })?.blocks)
    ? ((data as { blocks: Array<{ block?: { title?: string; type?: string; query?: { sourceType?: string } }; data?: unknown }> }).blocks)
    : []

  if (!blocks.length) {
    return (
      <EmptyState
        description="Add dashboard blocks to this view to show charts, lists, and tables."
        title="This dashboard is empty"
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => {
        const sourceType = block.block?.query?.sourceType ?? "PROJECT"
        const title = block.block?.title ?? sourceLabels[sourceType] ?? sourceType
        return (
          <DataView
            data={block.data}
            key={`${title}-${index}`}
            sourceType={sourceType}
            title={title}
            type={block.block?.type === "TABLE" ? "TABLE" : "LIST"}
          />
        )
      })}
    </div>
  )
}

export function PageViewPage() {
  const { pageId, viewId } = useParams()
  const [pageData, setPageData] = useState<DynamicPageResponse | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    if (!pageId) return
    let mounted = true
    setStatus("loading")
    pagesControllerGetPageV1({
      path: { pageId },
      query: { viewId: viewId ?? "" },
    }).then((result) => {
      if (!mounted) return
      if (result.error || !isPageResponse(result.data)) {
        setStatus("error")
        return
      }
      setPageData(result.data)
      setStatus("ready")
    })
    return () => {
      mounted = false
    }
  }, [pageId, viewId])

  const activeView = pageData?.activeView ?? null
  const sourceType = sourceFromView(activeView)
  const title = sourceLabels[sourceType] ?? pageData?.page.title ?? "Page"

  if (status === "loading") return <DashboardSkeleton />
  if (status === "error" || !pageData || !activeView) {
    return <PageError title="Page unavailable" />
  }

  return (
    <PageFrame
      action={<ViewBadge type={activeView.type} />}
      description={`${activeView.name} view from ${pageData.page.title}.`}
      eyebrow="Dynamic page"
      title={pageData.page.title}
    >
      {activeView.type === "DASHBOARD" ? (
        <DashboardView data={pageData.data} />
      ) : (
        <DataView
          data={pageData.data}
          sourceType={sourceType}
          title={title}
          type={activeView.type}
        />
      )}
    </PageFrame>
  )
}

export function HomePageRedirect() {
  const userInfo = useUserStore((state) => state.userInfo)
  const homePage = useMemo(() => {
    const organization = userInfo?.activeOrganization
    return (
      organization?.activeTeam?.pages?.find((page) => page.isHome) ??
      organization?.activeDepartment?.pages?.find((page) => page.isHome) ??
      organization?.pages?.find((page) => page.isHome) ??
      organization?.activeTeam?.pages?.[0] ??
      organization?.activeDepartment?.pages?.[0] ??
      organization?.pages?.[0] ??
      null
    )
  }, [userInfo])

  if (!homePage) {
    return (
      <PageFrame title="Home">
        <EmptyState
          description="Workspace pages will appear here once setup finishes."
          title="No home page yet"
        />
      </PageFrame>
    )
  }

  const defaultView = homePage.views.find((view) => view.isDefault) ?? homePage.views[0]
  return (
    <Navigate
      replace
      to={defaultView ? PATHS.pages.view(homePage.id, defaultView.id) : PATHS.pages.detail(homePage.id)}
    />
  )
}
