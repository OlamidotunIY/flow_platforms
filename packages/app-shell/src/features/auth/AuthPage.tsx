import { Navigate } from "react-router-dom"

import { PATHS } from "../../routing/paths"

export function AuthPage() {
  return <Navigate to={PATHS.auth.login} replace />
}
