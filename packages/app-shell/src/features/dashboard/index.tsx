import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  Activity,
  Blocks,
  Calendar,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  Gauge,
  Hash,
  Layers3,
  ListTodo,
  Settings2,
  Tag,
  Type,
  Users,
} from "lucide-react"
import {
  dashboardControllerGetDashboardV1,
  type DashboardActivityResponseDto,
  type DashboardResponseDto,
  type DashboardTaskResponseDto,
  type ProjectSummaryResponseDto,
} from "@flow/api"
import { Badge } from "@flow/ui/components/badge"
import { Button } from "@flow/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flow/ui/components/dropdown-menu"
import { cn } from "@flow/ui/lib/utils"
import { CustomDataTable } from "../../components/custom-data-table"
import {
  DashboardSkeleton,
  EmptyState,
  PageError,
  PageFrame,
} from "../../components/page-state"

const DASHBOARD_VIEW_KEY = "flow.dashboard.sections"

type SectionId =
  | "pulse"
  | "recentProjects"
  | "tasks"
  | "projects"
  | "templates"
  | "departments"
  | "teams"
  | "activity"

type DashboardSectionConfig = {
  id: SectionId
  title: string
  description: string
  defaultEnabled: boolean
}

const sectionConfig: DashboardSectionConfig[] = [
  {
    id: "pulse",
    title: "Workspace pulse",
    description: "Top-level counters for the active organization.",
    defaultEnabled: true,
  },
  {
    id: "recentProjects",
    title: "Recent projects",
    description: "Projects touched most recently in this workspace.",
    defaultEnabled: true,
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Work items that need attention.",
    defaultEnabled: true,
  },
  {
    id: "projects",
    title: "Project directory",
    description: "All projects available from the dashboard endpoint.",
    defaultEnabled: true,
  },
  {
    id: "templates",
    title: "Popular templates",
    description: "Reusable starting points for repeatable work.",
    defaultEnabled: true,
  },
  {
    id: "departments",
    title: "Departments",
    description: "Department structure for the organization.",
    defaultEnabled: false,
  },
  {
    id: "teams",
    title: "Teams",
    description: "Team structure grouped under departments.",
    defaultEnabled: false,
  },
  {
    id: "activity",
    title: "Activity log",
    description: "Recent workspace changes and updates.",
    defaultEnabled: true,
  },
]

function valueText(value: unknown, fallback = "Not set") {
  if (typeof value === "string" && value.trim()) return value
  if (typeof value === "number") return String(value)
  return fallback
}

function iconValue(value: unknown, fallback: ReactNode) {
  if (typeof value === "string" && value.trim()) return value
  return fallback
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "Not set"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function loadSectionPreferences() {
  try {
    const stored = window.localStorage.getItem(DASHBOARD_VIEW_KEY)
    if (!stored) return null
    return JSON.parse(stored) as Partial<Record<SectionId, boolean>>
  } catch {
    return null
  }
}

function MetricStrip({ dashboard }: { dashboard: DashboardResponseDto }) {
  return (
    <section className="standalone-widget overflow-hidden rounded-xl border bg-[#151915]/95 shadow-[0_24px_80px_-54px_oklch(0.55_0.18_151)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-heading text-base font-semibold">Workspace pulse</h2>
          <p className="text-xs text-muted-foreground">Counters from your active organization.</p>
        </div>
        <Gauge className="size-5 text-primary" />
      </div>
      <div className="flex gap-3 overflow-x-auto p-3">
        {dashboard.metrics.map((metric) => (
          <div
            className="min-w-56 rounded-lg border bg-background/35 p-4"
            key={metric.label}
          >
            <div className="mb-3 flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>{metric.label}</span>
              <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                {metric.label.toLowerCase().includes("task") ? (
                  <ListTodo className="size-4" />
                ) : (
                  <FolderKanban className="size-4" />
                )}
              </span>
            </div>
            <div className="text-3xl font-semibold tabular-nums">{metric.value}</div>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {valueText(metric.description, "Tracked by the dashboard endpoint.")}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function DashboardSection({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode
  description: string
  icon: ReactNode
  title: string
}) {
  return (
    <section className="standalone-widget overflow-hidden rounded-xl border bg-[#151915]/95 shadow-[0_24px_80px_-54px_oklch(0.55_0.18_151)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}

function TemplateSection({ dashboard }: { dashboard: DashboardResponseDto }) {
  return (
    <DashboardSection
      description="Reusable starting points for repeatable work."
      icon={<Blocks className="size-4" />}
      title="Popular templates"
    >
      {dashboard.popularTemplates.length ? (
        <div className="flex flex-col divide-y divide-white/10">
          {dashboard.popularTemplates.map((template) => (
            <div className="flex items-center justify-between gap-4 py-3" key={template.id}>
              <div className="min-w-0">
                <div className="truncate font-medium">{template.name}</div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {valueText(template.description, "Reusable workspace structure")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge className="rounded-md" variant="outline">
                  {valueText(template.category, "Template")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {template.projectCount} projects
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Templates returned by the backend will appear in this section."
          title="No templates yet"
        />
      )}
    </DashboardSection>
  )
}

function ActivitySection({ logs }: { logs: DashboardActivityResponseDto[] }) {
  return (
    <DashboardSection
      description="Recent workspace changes and updates."
      icon={<Activity className="size-4" />}
      title="Activity log"
    >
      {logs.length ? (
        <div className="flex flex-col divide-y divide-white/10">
          {logs.map((log) => (
            <div className="flex items-start gap-3 py-3" key={log.id}>
              <span className="mt-0.5 grid size-8 place-items-center rounded-md bg-muted/45 text-muted-foreground">
                <Activity className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {valueText(log.userName, "Someone")} {log.action.toLowerCase()}
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {log.entityType} / {valueText(log.projectName ?? log.taskTitle ?? log.entityId)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Workspace activity will be shown as the team works."
          title="No activity yet"
        />
      )}
    </DashboardSection>
  )
}

function projectColumns() {
  return [
    {
      id: "name",
      header: "Project name",
      icon: <Type className="size-3.5" />,
      accessor: (row: ProjectSummaryResponseDto) => row.name,
      render: (row: ProjectSummaryResponseDto) => (
        <span className="inline-flex min-w-0 items-center gap-2 font-medium">
          <span className="text-primary">{iconValue(row.icon, <FolderKanban className="size-4" />)}</span>
          <span className="truncate">{row.name}</span>
        </span>
      ),
      width: "28%",
    },
    {
      id: "status",
      header: "Status",
      icon: <CircleDot className="size-3.5" />,
      accessor: (row: ProjectSummaryResponseDto) => row.status,
      kind: "status" as const,
      width: "12%",
    },
    {
      id: "scope",
      header: "Scope",
      icon: <Layers3 className="size-3.5" />,
      accessor: (row: ProjectSummaryResponseDto) => row.scope,
      width: "12%",
    },
    {
      id: "tasks",
      header: "Tasks",
      icon: <ListTodo className="size-3.5" />,
      accessor: (row: ProjectSummaryResponseDto) => row.taskCount,
      kind: "number" as const,
      width: "10%",
    },
    {
      id: "members",
      header: "Members",
      icon: <Users className="size-3.5" />,
      accessor: (row: ProjectSummaryResponseDto) => row.memberCount,
      kind: "number" as const,
      width: "10%",
    },
    {
      id: "updated",
      header: "Updated",
      icon: <Calendar className="size-3.5" />,
      accessor: (row: ProjectSummaryResponseDto) => formatDate(row.updatedAt),
      defaultVisible: false,
      width: "14%",
    },
  ]
}

function taskColumns() {
  return [
    {
      id: "title",
      header: "Task name",
      icon: <Type className="size-3.5" />,
      accessor: (row: DashboardTaskResponseDto) => row.title,
      render: (row: DashboardTaskResponseDto) => (
        <span className="inline-flex min-w-0 items-center gap-2 font-medium">
          <span className="text-primary">{iconValue(row.icon, <ListTodo className="size-4" />)}</span>
          <span className="truncate">{row.title}</span>
        </span>
      ),
      width: "30%",
    },
    {
      id: "status",
      header: "Status",
      icon: <CircleDot className="size-3.5" />,
      accessor: (row: DashboardTaskResponseDto) => row.status,
      kind: "status" as const,
      width: "12%",
    },
    {
      id: "project",
      header: "Project",
      icon: <FolderKanban className="size-3.5" />,
      accessor: (row: DashboardTaskResponseDto) => row.projectName,
      width: "18%",
    },
    {
      id: "priority",
      header: "Priority",
      icon: <Tag className="size-3.5" />,
      accessor: (row: DashboardTaskResponseDto) => row.priority,
      kind: "priority" as const,
      width: "12%",
    },
    {
      id: "assignees",
      header: "Assignees",
      icon: <Users className="size-3.5" />,
      accessor: (row: DashboardTaskResponseDto) => `${row.assigneeCount} assigned`,
      kind: "person" as const,
      width: "14%",
    },
    {
      id: "due",
      header: "Due",
      icon: <Calendar className="size-3.5" />,
      accessor: (row: DashboardTaskResponseDto) => formatDate(row.dueDate),
      defaultVisible: false,
      width: "14%",
    },
  ]
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponseDto | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [enabledSections, setEnabledSections] = useState<Record<SectionId, boolean>>(() => {
    const stored = loadSectionPreferences()

    return sectionConfig.reduce(
      (accumulator, section) => ({
        ...accumulator,
        [section.id]: stored?.[section.id] ?? section.defaultEnabled,
      }),
      {} as Record<SectionId, boolean>
    )
  })

  function setSectionEnabled(sectionId: SectionId, enabled: boolean) {
    setEnabledSections((current) => {
      const next = { ...current, [sectionId]: enabled }
      window.localStorage.setItem(DASHBOARD_VIEW_KEY, JSON.stringify(next))
      return next
    })
  }

  function loadDashboard() {
    let mounted = true
    setStatus("loading")

    dashboardControllerGetDashboardV1().then((result) => {
      if (!mounted) return

      if (result.error || !result.data) {
        setErrorMessage("The dashboard endpoint did not return workspace data.")
        setStatus("error")
        return
      }

      setDashboard(result.data)
      setStatus("ready")
    })

    return () => {
      mounted = false
    }
  }

  useEffect(() => loadDashboard(), [])

  const enabledCount = useMemo(
    () => Object.values(enabledSections).filter(Boolean).length,
    [enabledSections]
  )

  if (status === "loading") {
    return <DashboardSkeleton />
  }

  if (!dashboard) {
    return (
      <PageError
        message={errorMessage}
        onRetry={() => {
          loadDashboard()
        }}
        title="Dashboard unavailable"
      />
    )
  }

  const sections: Record<SectionId, ReactNode> = {
    pulse: <MetricStrip dashboard={dashboard} />,
    recentProjects: (
      <CustomDataTable<ProjectSummaryResponseDto>
        addLabel="New project"
        columns={projectColumns()}
        description="A property table for the projects touched most recently."
        rows={dashboard.recentProjects}
        title="Recent projects"
      />
    ),
    tasks: (
      <CustomDataTable<DashboardTaskResponseDto>
        addLabel="New task"
        columns={taskColumns()}
        description="Customizable task properties for the active workspace."
        rows={dashboard.tasks}
        title="Tasks"
      />
    ),
    projects: (
      <CustomDataTable<ProjectSummaryResponseDto>
        addLabel="New project"
        columns={projectColumns()}
        description="All projects returned by the dashboard endpoint."
        rows={dashboard.projects}
        title="Project directory"
      />
    ),
    templates: <TemplateSection dashboard={dashboard} />,
    departments: (
      <CustomDataTable
        addLabel="New department"
        columns={[
          { id: "name", header: "Department", icon: <Type className="size-3.5" />, accessor: (row) => row.name, width: "35%" },
          { id: "created", header: "Created", icon: <Calendar className="size-3.5" />, accessor: (row) => formatDate(row.createdAt), width: "20%" },
          { id: "updated", header: "Updated", icon: <Calendar className="size-3.5" />, accessor: (row) => formatDate(row.updatedAt), defaultVisible: false, width: "20%" },
          { id: "org", header: "Organization", icon: <Hash className="size-3.5" />, accessor: (row) => row.organizationId, defaultVisible: false, width: "25%" },
        ]}
        description="Department records and configurable properties."
        rows={dashboard.departments}
        title="Departments"
      />
    ),
    teams: (
      <CustomDataTable
        addLabel="New team"
        columns={[
          { id: "name", header: "Team", icon: <Users className="size-3.5" />, accessor: (row) => row.name, width: "35%" },
          { id: "department", header: "Department", icon: <Layers3 className="size-3.5" />, accessor: (row) => valueText(row.departmentId), width: "20%" },
          { id: "org", header: "Organization", icon: <Hash className="size-3.5" />, accessor: (row) => row.organizationId, defaultVisible: false, width: "25%" },
        ]}
        description="Teams that can own or group project work."
        rows={dashboard.teams}
        title="Teams"
      />
    ),
    activity: <ActivitySection logs={dashboard.activityLogs} />,
  }

  return (
    <PageFrame
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2" type="button" variant="outline">
              <Settings2 />
              Customize view
              <Badge className="rounded-md" variant="outline">
                {enabledCount}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Dashboard sections</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sectionConfig.map((section) => (
              <DropdownMenuCheckboxItem
                checked={enabledSections[section.id]}
                key={section.id}
                onCheckedChange={(checked) => setSectionEnabled(section.id, Boolean(checked))}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{section.title}</span>
                  <span className="truncate text-[0.6875rem] text-muted-foreground">
                    {section.description}
                  </span>
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
      description="A personal workspace made from sections you choose. Hide the pieces you do not need and tune fields inside every table."
      eyebrow="Custom dashboard"
      title="Home"
    >
      {sectionConfig.some((section) => enabledSections[section.id]) ? (
        <div className="flex flex-col gap-5">
          {sectionConfig.map((section) => (
            <div
              className={cn(!enabledSections[section.id] && "hidden")}
              key={section.id}
            >
              {sections[section.id]}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Use Customize view to add sections back to your home dashboard."
          title="No dashboard sections enabled"
        />
      )}
      {dashboard.customFields.length ? (
        <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            Custom fields available
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard.customFields.map((field) => (
              <Badge className="rounded-md" key={field.id} variant="outline">
                {field.name} / {field.type}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </PageFrame>
  )
}
