export const PATHS = {
  root: "/",
  auth: {
    root: "/auth",
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/verify-email",
  },
  messages: {
    root: "/messages",
  },
  projects: {
    root: "/projects",
    detail: (projectId: string) => `/projects/${projectId}`,
  },
  error: {
    root: "/error",
    notFound: "/error/404",
    server: "/error/500",
  },
} as const
