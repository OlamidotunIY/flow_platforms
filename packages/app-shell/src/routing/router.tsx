import { createBrowserRouter, Navigate } from "react-router-dom"

import { Error404Page, Error500Page } from "../features/errors"
import {
  ForgotPasswordPage,
  LoginPage,
  RequireAuth,
  ResetPasswordPage,
  SignUpPage,
  VerifyEmailPage,
} from "../features/auth"
import { AskAiPage } from "../features/ask-ai"
import { HomePageRedirect, PageViewPage } from "../features/pages"
import { InboxPage, InboxRoomPage } from "../features/inbox"
import { UnderDevelopmentPage } from "../features/under-development"
import {
  CreateWorkspacePage,
  DepartmentPage,
  RecoveryInfoPage,
  RequireWorkspace,
  WorkspaceRecoveryLayout,
} from "../features/workspace"
import { AuthLayout } from "../layouts/AuthLayout"
import { ErrorsLayout } from "../layouts/errors"
import { MainLayout } from "../layouts/mainLayout"
import RootLayout from "../layouts/RootLayout"
import { PATHS } from "./paths"

export const router = createBrowserRouter([
  {
    path: PATHS.root,
    element: <RootLayout />,
    children: [
      {
        path: PATHS.auth.root,
        element: <AuthLayout />,
        children: [
          {
            path: PATHS.auth.login,
            element: <LoginPage />,
          },
          {
            path: PATHS.auth.signup,
            element: <SignUpPage />,
          },
          {
            path: PATHS.auth.forgotPassword,
            element: <ForgotPasswordPage />,
          },
          {
            path: PATHS.auth.resetPassword,
            element: <ResetPasswordPage />,
          },
        ],
      },
      {
        path: PATHS.auth.verifyEmail,
        element: <VerifyEmailPage />,
      },
      {
        path: PATHS.root,
        element: <RequireAuth />,
        children: [
          {
            element: <RequireWorkspace />,
            children: [
              {
                path: PATHS.workspace.root,
                element: <WorkspaceRecoveryLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to={PATHS.workspace.create} replace />,
                  },
                  {
                    path: PATHS.workspace.create,
                    element: <CreateWorkspacePage />,
                  },
                  {
                    path: PATHS.workspace.department,
                    element: <DepartmentPage />,
                  },
                  {
                    path: PATHS.workspace.teams,
                    element: (
                      <RecoveryInfoPage
                        description="Team recovery will be enabled when the generated API exposes team creation."
                        title="Teams"
                      />
                    ),
                  },
                  {
                    path: PATHS.workspace.plans,
                    element: (
                      <RecoveryInfoPage
                        description="Plan recovery will be enabled when plan setup endpoints are available."
                        title="Plans"
                      />
                    ),
                  },
                  {
                    path: PATHS.workspace.members,
                    element: (
                      <RecoveryInfoPage
                        description="Member recovery will be enabled when invitation or member setup endpoints are available."
                        title="Members"
                      />
                    ),
                  },
                ],
              },
              {
                element: <MainLayout />,
                children: [
                  {
                    index: true,
                    element: <HomePageRedirect />,
                  },
                  {
                    path: "/p/:pageId",
                    element: <PageViewPage />,
                  },
                  {
                    path: PATHS.app.askAi,
                    element: <AskAiPage />,
                  },
                  {
                    path: PATHS.app.inbox,
                    element: <InboxPage />,
                  },
                  {
                    path: "/inbox/:chatRoomId",
                    element: <InboxRoomPage />,
                  },
                  {
                    path: PATHS.app.calendar,
                    element: <Navigate to={PATHS.app.meetings} replace />,
                  },
                  {
                    path: PATHS.app.meetings,
                    element: <UnderDevelopmentPage title="Meeting" />,
                  },
                  {
                    path: PATHS.app.settings,
                    element: <UnderDevelopmentPage title="Settings" />,
                  },
                  {
                    path: PATHS.app.templates,
                    element: <UnderDevelopmentPage title="Templates" />,
                  },
                  {
                    path: PATHS.app.trash,
                    element: <UnderDevelopmentPage title="Trash" />,
                  },
                  {
                    path: PATHS.app.help,
                    element: <UnderDevelopmentPage title="Help" />,
                  },
                  {
                    path: PATHS.app.account,
                    element: <UnderDevelopmentPage title="Account" />,
                  },
                  {
                    path: PATHS.app.billing,
                    element: <UnderDevelopmentPage title="Billing" />,
                  },
                  {
                    path: PATHS.app.notifications,
                    element: <UnderDevelopmentPage title="Notifications" />,
                  },
                  {
                    path: PATHS.projects.root,
                    element: <UnderDevelopmentPage title="Projects" />,
                  },
                  {
                    path: "/projects/:projectId",
                    element: <UnderDevelopmentPage title="Project" />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: PATHS.error.root,
        element: <ErrorsLayout />,
        children: [
          {
            index: true,
            element: <Error404Page />,
          },
          {
            path: PATHS.error.notFound,
            element: <Error404Page />,
          },
          {
            path: PATHS.error.server,
            element: <Error500Page />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={PATHS.error.notFound} replace />,
      },
    ],
  },
])
