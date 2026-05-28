import { createBrowserRouter, Navigate } from "react-router-dom"

import { Error404Page, Error500Page } from "../features/errors"
import { ForgotPasswordPage, LoginPage, RequireAuth, ResetPasswordPage, SignUpPage, VerifyEmailPage } from "../features/auth"
import { AskAiPage } from "../features/ask-ai"
import { HomePageRedirect, PageViewPage } from "../features/pages"
import { InboxPage, InboxRoomPage } from "../features/inbox"
import { SearchPage } from "../features/search"
import { UnderDevelopmentPage } from "../features/under-development"
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
            element: <MainLayout />,
            children: [
              {
                index: true,
                element: <HomePageRedirect />,
              },
              {
                path: "/pages/:pageId",
                element: <PageViewPage />,
              },
              {
                path: "/pages/:pageId/views/:viewId",
                element: <PageViewPage />,
              },
              {
                path: PATHS.app.search,
                element: <SearchPage />,
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
                element: <UnderDevelopmentPage title="Calendar" />,
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
          }
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
