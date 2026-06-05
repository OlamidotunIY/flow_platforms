import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@flow/ui/components/button"
import { Input } from "@flow/ui/components/input"
import { departmentsControllerCreateDepartmentV1 } from "@flow/api"

import { PATHS } from "../../../routing/paths"
import { type WorkspaceContext, useUserStore } from "../../../store/userStore"
import { WorkspaceRecoveryPanel } from "../components/WorkspaceLoadingShell"

export default function DepartmentPage() {
  const navigate = useNavigate()
  const activeOrganization = useUserStore(
    (state) => state.userInfo?.activeOrganization
  )
  const setWorkspaceContext = useUserStore((state) => state.setWorkspaceContext)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!activeOrganization) {
      setError("Create a workspace before adding a department.")
      return
    }

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()

    if (!name) {
      setError("Department name is required.")
      return
    }

    setIsSubmitting(true)
    const result = await departmentsControllerCreateDepartmentV1({
      body: {
        name,
        organizationId: activeOrganization.id,
      },
    })
    setIsSubmitting(false)

    if (result.error || !result.data) {
      setError("Could not create the department. Please try again.")
      return
    }

    setWorkspaceContext(result.data as unknown as WorkspaceContext)
    navigate(PATHS.root, { replace: true })
  }

  return (
    <WorkspaceRecoveryPanel
      description="Add or repair the active department for this workspace."
      title="Department"
    >
      <form className="grid max-w-xl gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-medium">
          Department name
          <Input name="name" placeholder="Engineering" />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-fit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create department"}
        </Button>
      </form>
    </WorkspaceRecoveryPanel>
  )
}
