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
  app: {
    account: "/account",
    askAi: "/ask-ai",
    billing: "/billing",
    calendar: "/calendar",
    help: "/help",
    home: "/",
    inbox: "/inbox",
    notifications: "/notifications",
    search: "/search",
    settings: "/settings",
    templates: "/templates",
    trash: "/trash",
  },
  projects: {
    root: "/projects",
    detail: (projectId: string) => `/projects/${projectId}`,
  },
  pages: {
    detail: (pageId: string) => `/pages/${pageId}`,
    view: (pageId: string, viewId: string) => `/pages/${pageId}/views/${viewId}`,
  },
  inbox: {
    detail: (chatRoomId: string) => `/inbox/${chatRoomId}`,
  },
  error: {
    root: "/error",
    notFound: "/error/404",
    server: "/error/500",
  },
} as const
