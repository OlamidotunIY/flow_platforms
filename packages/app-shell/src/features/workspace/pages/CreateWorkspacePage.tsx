import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@flow/ui/components/button"
import { Input } from "@flow/ui/components/input"
import {
  organizationsControllerCreateOrganizationV1,
  type CreateOrganizationDto,
} from "@flow/api"

import { PATHS } from "../../../routing/paths"
import { type WorkspaceContext, useUserStore } from "../../../store/userStore"
import { WorkspaceRecoveryPanel } from "../components/WorkspaceLoadingShell"

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function CreateWorkspacePage() {
  const navigate = useNavigate()
  const setWorkspaceContext = useUserStore((state) => state.setWorkspaceContext)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const slug = String(formData.get("slug") ?? "").trim() || slugify(name)
    const departmentName = String(formData.get("departmentName") ?? "").trim()

    if (!name || !slug) {
      setError("Workspace name and slug are required.")
      return
    }

    setIsSubmitting(true)
    const body: CreateOrganizationDto = {
      name,
      slug,
      departmentName: departmentName || undefined,
    }
    const result = await organizationsControllerCreateOrganizationV1({ body })
    setIsSubmitting(false)

    if (result.error || !result.data) {
      setError("Could not create the workspace. Please try again.")
      return
    }

    setWorkspaceContext(result.data as WorkspaceContext)
    navigate(PATHS.root, { replace: true })
  }

  return (
    <WorkspaceRecoveryPanel
      description="Create the workspace container and first department. If this succeeds, Flow will open the app normally."
      title="Create workspace"
    >
      <form className="grid max-w-xl gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-medium">
          Workspace name
          <Input name="name" placeholder="Acme Studio" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Workspace slug
          <Input name="slug" placeholder="acme-studio" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          First department
          <Input name="departmentName" placeholder="General" />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-fit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create workspace"}
          <ArrowRight />
        </Button>
      </form>
    </WorkspaceRecoveryPanel>
  )
}
