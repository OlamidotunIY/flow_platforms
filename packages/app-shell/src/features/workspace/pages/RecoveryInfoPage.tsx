import { WorkspaceRecoveryPanel } from "../components/WorkspaceLoadingShell"

export function RecoveryInfoPage({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <WorkspaceRecoveryPanel description={description} title={title}>
      <div className="max-w-2xl rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        This recovery step is ready for its API endpoint. For now, use retry
        automatic setup or finish the available workspace and department steps.
      </div>
    </WorkspaceRecoveryPanel>
  )
}
