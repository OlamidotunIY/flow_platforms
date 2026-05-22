import { createBrowserRouter, Navigate } from "react-router-dom"

import { Error404Page, Error500Page } from "../features/errors"
import { ForgotPasswordPage, LoginPage, RequireAuth, ResetPasswordPage, SignUpPage, VerifyEmailPage } from "../features/auth"
import { MessagesPage } from "../features/messages"
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
                element: <MessagesPage />,
              },
              {
                path: PATHS.messages.root,
                element: <MessagesPage />,
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
