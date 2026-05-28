import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ArrowDownUp,
  Calendar,
  ChevronDown,
  CheckSquare,
  Eye,
  EyeOff,
  Filter,
  GripVertical,
  Hash,
  ListFilter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Sparkles,
  Type,
  Zap,
} from "lucide-react"
import { Badge } from "@flow/ui/components/badge"
import { Button } from "@flow/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flow/ui/components/dropdown-menu"
import { Input } from "@flow/ui/components/input"
import { cn } from "@flow/ui/lib/utils"

export type DataTableColumn<T> = {
  id: string
  header: string
  accessor: (row: T) => unknown
  defaultVisible?: boolean
  icon?: ReactNode
  kind?: "text" | "status" | "priority" | "date" | "progress" | "number" | "person"
  render?: (row: T) => ReactNode
  width?: string
}

export type CustomFieldDefinition = {
  id: string
  name: string
  key?: string
  type: string
  sortOrder?: number
}

export type CustomFieldValue = {
  fieldId?: string
  valueText?: string | null
  valueNumber?: number | null
  valueBoolean?: boolean | null
  valueDate?: string | null
  valueJson?: unknown
  field?: CustomFieldDefinition
}

function fallbackIcon(icon: ReactNode) {
  return icon ?? <Type className="size-3.5" />
}

function priorityTone(value: string) {
  const priority = value.toLowerCase()

  if (priority === "urgent" || priority === "high") {
    return "border-red-400/25 bg-red-500/20 text-red-100"
  }

  if (priority === "medium") {
    return "border-amber-400/25 bg-amber-500/20 text-amber-100"
  }

  return "border-emerald-400/25 bg-emerald-500/20 text-emerald-100"
}

function customFieldIcon(type: string) {
  if (type === "NUMBER") return <Hash className="size-3.5" />
  if (type === "BOOLEAN") return <CheckSquare className="size-3.5" />
  if (type === "DATE") return <Calendar className="size-3.5" />
  return <Type className="size-3.5" />
}

function formatDateValue(value: unknown) {
  if (!value) return null
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (Array.isArray(value)) return value.map(stringifyValue).filter(Boolean).join(", ")
  if (typeof value === "object" && "name" in value && typeof value.name === "string") return value.name
  if (typeof value === "object" && "email" in value && typeof value.email === "string") return value.email
  return JSON.stringify(value)
}

function getCustomValue(value: CustomFieldValue | undefined, field: CustomFieldDefinition) {
  if (!value) return undefined
  if (field.type === "NUMBER") return value.valueNumber
  if (field.type === "BOOLEAN") return value.valueBoolean
  if (field.type === "DATE") return value.valueDate
  if (["SINGLE_SELECT", "MULTI_SELECT", "USERS", "JSON"].includes(field.type)) return value.valueJson
  return value.valueText ?? value.valueJson
}

function renderCustomFieldValue(value: unknown, field: CustomFieldDefinition) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/70">Empty</span>
  }

  if (field.type === "BOOLEAN") {
    return <span className="tabular-nums">{value ? "Yes" : "No"}</span>
  }

  if (field.type === "DATE") {
    return <span>{formatDateValue(value)}</span>
  }

  if (field.type === "SINGLE_SELECT") {
    return (
      <Badge className="rounded-md border-blue-400/25 bg-blue-500/20 px-2 text-blue-100" variant="outline">
        {stringifyValue(value)}
      </Badge>
    )
  }

  if (field.type === "MULTI_SELECT" || field.type === "USERS") {
    const values = Array.isArray(value) ? value : [value]
    return (
      <span className="inline-flex max-w-72 flex-wrap gap-1">
        {values.map((item, index) => (
          <Badge className="rounded-md" key={`${field.id}-${index}`} variant="outline">
            {stringifyValue(item)}
          </Badge>
        ))}
      </span>
    )
  }

  if (field.type === "URL" && typeof value === "string") {
    return (
      <a className="truncate text-primary hover:underline" href={value} rel="noreferrer" target="_blank">
        {value}
      </a>
    )
  }

  return <span className="truncate">{stringifyValue(value)}</span>
}

function renderCell(
  value: unknown,
  kind?: DataTableColumn<unknown>["kind"]
) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/70">Empty</span>
  }

  if (kind === "status") {
    return (
      <Badge className="gap-1.5 rounded-md border-blue-400/25 bg-blue-500/20 px-2 text-blue-100" variant="outline">
        <span className="size-1.5 rounded-full bg-blue-300" />
        {String(value).replace(/_/g, " ")}
      </Badge>
    )
  }

  if (kind === "priority") {
    return (
      <Badge className={cn("rounded-md px-2", priorityTone(String(value)))} variant="outline">
        {String(value)}
      </Badge>
    )
  }

  if (kind === "progress") {
    const numeric = Number(value)
    const clamped = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0

    return (
      <div className="flex min-w-32 items-center gap-2">
        <span className="w-12 tabular-nums text-foreground">{clamped.toFixed(0)}%</span>
        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${clamped}%` }}
          />
        </span>
      </div>
    )
  }

  if (kind === "person") {
    const label = String(value)
    return (
      <span className="inline-flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-full border bg-muted text-[0.625rem] text-muted-foreground">
          {label.slice(0, 1).toUpperCase()}
        </span>
        <span className="truncate">{label}</span>
      </span>
    )
  }

  if (kind === "number") {
    return <span className="tabular-nums">{String(value)}</span>
  }

  return <span className="truncate">{String(value)}</span>
}

function PropertyRow<T>({
  column,
  muted,
  onToggle,
}: {
  column: DataTableColumn<T>
  muted?: boolean
  onToggle: () => void
}) {
  return (
    <button
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left text-sm transition-colors hover:bg-foreground/10",
        muted && "text-muted-foreground"
      )}
      onClick={onToggle}
      type="button"
    >
      <GripVertical className="size-3.5 text-muted-foreground/70" />
      <span className="grid size-5 place-items-center text-muted-foreground">
        {fallbackIcon(column.icon)}
      </span>
      <span className="min-w-0 flex-1 truncate">{column.header}</span>
      {muted ? (
        <EyeOff className="size-4 text-muted-foreground" />
      ) : (
        <Eye className="size-4 text-muted-foreground" />
      )}
    </button>
  )
}

export function CustomDataTable<T>({
  addLabel,
  columns,
  customFields = [],
  customValuesAccessor,
  description,
  rows,
  title,
}: {
  addLabel?: string
  columns: DataTableColumn<T>[]
  customFields?: CustomFieldDefinition[]
  customValuesAccessor?: (row: T) => CustomFieldValue[] | undefined
  description?: string
  rows: T[]
  title: string
}) {
  const [filter, setFilter] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const tableColumns = useMemo(() => {
    const fieldColumns: DataTableColumn<T>[] = [...customFields]
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
      .map((field) => ({
        id: `field-${field.id}`,
        header: field.name,
        icon: customFieldIcon(field.type),
        accessor: (row) => {
          const values = customValuesAccessor?.(row) ?? []
          return getCustomValue(
            values.find((value) => value.fieldId === field.id || value.field?.id === field.id),
            field
          )
        },
        render: (row) => {
          const values = customValuesAccessor?.(row) ?? []
          return renderCustomFieldValue(
            getCustomValue(
              values.find((value) => value.fieldId === field.id || value.field?.id === field.id),
              field
            ),
            field
          )
        },
        defaultVisible: true,
      }))

    return [...columns, ...fieldColumns]
  }, [columns, customFields, customValuesAccessor])
  const [visibleColumns, setVisibleColumns] = useState(() => new Set<string>())

  useEffect(() => {
    setVisibleColumns((current) => {
      if (current.size > 0) return current
      return new Set(
        tableColumns
          .filter((column) => column.defaultVisible !== false)
          .map((column) => column.id)
      )
    })
  }, [tableColumns])

  const filteredRows = useMemo(() => {
    const query = filter.trim().toLowerCase()

    if (!query) return rows

    return rows.filter((row) =>
      tableColumns.some((column) =>
        String(column.accessor(row) ?? "")
          .toLowerCase()
          .includes(query)
      )
    )
  }, [filter, rows, tableColumns])

  const propertyQuery = propertyFilter.trim().toLowerCase()
  const activeColumns = tableColumns.filter((column) => visibleColumns.has(column.id))
  const hiddenColumns = tableColumns.filter((column) => !visibleColumns.has(column.id))
  const shownProperties = activeColumns.filter((column) =>
    column.header.toLowerCase().includes(propertyQuery)
  )
  const hiddenProperties = hiddenColumns.filter((column) =>
    column.header.toLowerCase().includes(propertyQuery)
  )

  function toggleColumn(columnId: string) {
    setVisibleColumns((current) => {
      const next = new Set(current)

      if (next.has(columnId)) {
        next.delete(columnId)
      } else {
        next.add(columnId)
      }

      return next
    })
  }

  return (
    <section className="standalone-widget overflow-hidden rounded-xl border bg-[#151915]/95 text-card-foreground shadow-[0_24px_80px_-54px_oklch(0.55_0.18_151)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-heading text-base font-semibold">{title}</h2>
            <span className="rounded-md bg-muted/45 px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
              {filteredRows.length}
            </span>
          </div>
          {description ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button aria-label="Filter" size="icon-sm" type="button" variant="ghost">
            <Filter />
          </Button>
          <Button aria-label="Sort" size="icon-sm" type="button" variant="ghost">
            <ArrowDownUp />
          </Button>
          <Button aria-label="Automations" size="icon-sm" type="button" variant="ghost">
            <Zap />
          </Button>
          <Button aria-label="AI assist" size="icon-sm" type="button" variant="ghost">
            <Sparkles />
          </Button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-7 w-44 rounded-md border-transparent bg-muted/35 pl-7 text-xs shadow-none focus-visible:bg-background"
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search rows..."
              value={filter}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Property visibility" size="icon-sm" type="button" variant="ghost">
                <SlidersHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[22rem] rounded-xl border bg-[#151915]/95 p-2 shadow-2xl"
              sideOffset={8}
            >
              <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-foreground">
                <ListFilter className="size-4 text-primary" />
                Property visibility
              </DropdownMenuLabel>
              <div className="px-2 pb-2">
                <Input
                  autoFocus
                  className="h-8 bg-background/70"
                  onChange={(event) => setPropertyFilter(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder="Search for a property..."
                  value={propertyFilter}
                />
              </div>
              <div className="max-h-[22rem] overflow-auto px-1 pb-1">
                <div className="px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground">
                  Shown in table
                </div>
                {shownProperties.map((column) => (
                  <PropertyRow
                    column={column}
                    key={column.id}
                    onToggle={() => toggleColumn(column.id)}
                  />
                ))}
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground">
                  <span>Hidden in table</span>
                  <button
                    className="text-primary hover:text-primary/80"
                    onClick={() => setVisibleColumns(new Set(tableColumns.map((column) => column.id)))}
                    type="button"
                  >
                    Show all
                  </button>
                </div>
                {hiddenProperties.map((column) => (
                  <PropertyRow
                    column={column}
                    key={column.id}
                    muted
                    onToggle={() => toggleColumn(column.id)}
                  />
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="mx-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
                Add property is available from property settings.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="h-7 gap-1 rounded-md px-2.5" type="button">
            New
            <ChevronDown className="size-3.5" />
          </Button>
          <Button aria-label="More table actions" size="icon-sm" type="button" variant="ghost">
            <MoreHorizontal />
          </Button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground">
              {activeColumns.map((column) => (
                <th
                  className="h-10 border-r border-white/10 px-3 text-xs font-medium last:border-r-0"
                  key={column.id}
                  style={{ width: column.width }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">{fallbackIcon(column.icon)}</span>
                    {column.header}
                  </span>
                </th>
              ))}
              <th className="h-10 w-20 px-2">
                <div className="flex justify-end gap-1 text-muted-foreground">
                  <MoreHorizontal className="size-3.5" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr
                className="border-b border-white/10 transition-colors hover:bg-white/[0.035]"
                key={rowIndex}
              >
                {activeColumns.map((column) => (
                  <td
                    className="h-11 max-w-80 border-r border-white/10 px-3 text-sm last:border-r-0"
                    key={column.id}
                  >
                    {column.render ? column.render(row) : renderCell(column.accessor(row), column.kind)}
                  </td>
                ))}
                <td className="h-11 px-2" />
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  className="h-24 px-3 text-sm text-muted-foreground"
                  colSpan={Math.max(activeColumns.length + 1, 1)}
                >
                  No rows match this view.
                </td>
              </tr>
            ) : null}
            <tr>
              <td
                className="h-10 px-3 text-sm text-muted-foreground"
                colSpan={Math.max(activeColumns.length + 1, 1)}
              >
                <button className="inline-flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/35 hover:text-foreground" type="button">
                  {addLabel ?? `New ${title.toLowerCase().replace(/s$/, "")}`}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
