/// <reference path="../../../types/desktop-window.d.ts" />

import type * as React from "react"
import { CardDescription, CardTitle } from "@flow/ui/components/card"
import { Spinner } from "@flow/ui/components/spinner"

import { getFlowAuthEndpointUrl } from "@flow/api"

export type AuthStep = "email" | "password"

export function isAppleDevice()
{
  if (typeof navigator === "undefined")
  {
    return false
  }

  return /Mac|iPhone|iPad|iPod/i.test(
    `${navigator.platform} ${navigator.userAgent}`
  )
}

export function FlowLogo({
  title,
  description,
}: {
  title: string
  description: string
})
{
  return (
    <div className="mx-auto flex flex-col items-center gap-3">
      <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground ring-1 ring-primary/30">
        <span className="font-heading text-lg leading-none font-semibold">
          F
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <CardTitle className="text-xl leading-7">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </div>
  )
}

export function AppleIcon()
{
  return (
    <svg data-icon="inline-start" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.417 2.202-1.252 3.184-.9 1.04-1.987 1.638-3.06 1.543-.13-1.087.43-2.238 1.214-3.148.862-.995 2.36-1.755 3.098-1.58Zm3.04 15.153c-.557 1.284-.824 1.858-1.54 2.993-.999 1.535-2.407 3.448-4.15 3.465-1.55.017-1.95-1.012-4.061-1-2.11.012-2.55 1.02-4.1 1.005-1.744-.016-3.075-1.74-4.075-3.276-2.787-4.28-3.08-9.304-1.36-11.968 1.22-1.89 3.146-2.995 4.958-2.995 1.844 0 3.005 1.012 4.532 1.012 1.48 0 2.382-1.014 4.515-1.014 1.613 0 3.322.879 4.538 2.397-3.987 2.185-3.34 7.88.743 9.381Z"
      />
    </svg>
  )
}

export function GoogleIcon()
{
  return (
    <svg data-icon="inline-start" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.82-.07-1.42-.22-2.04H12v4.01h6.62c-.13 1-.85 2.52-2.44 3.54l-.02.13 3.55 2.62.25.02c2.31-2.03 3.53-5.02 3.53-8.28Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.31 0 6.09-1.04 8.12-2.83l-3.87-2.89c-1.04.69-2.43 1.17-4.25 1.17-3.24 0-5.99-2.03-6.97-4.83l-.14.01-3.69 2.73-.05.13C3.16 20.83 7.26 23.5 12 23.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.03 14.12A6.78 6.78 0 0 1 4.66 12c0-.74.13-1.45.36-2.12l-.01-.14-3.74-2.78-.12.05A11.09 11.09 0 0 0 .01 12c0 1.79.44 3.47 1.22 4.96l3.8-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.05c2.3 0 3.86.95 4.74 1.74l3.46-3.23C18.08 1.67 15.31.5 12 .5 7.26.5 3.16 3.17 1.15 7.01l3.88 2.87C6.01 7.08 8.76 5.05 12 5.05Z"
      />
    </svg>
  )
}

export function LoadingButtonContent({
  children,
  isLoading,
}: {
  children: React.ReactNode
  isLoading: boolean
})
{
  return (
    <>
      {isLoading ? <Spinner /> : null}
      <span>{children}</span>
    </>
  )
}

export function getAuthErrorMessage(error: unknown)
{
  if (error instanceof Error && error.name === "AbortError")
  {
    return "The auth request timed out. Check the console for request details."
  }

  if (error instanceof TypeError && error.message === "Failed to fetch")
  {
    return "Unable to reach the auth server. Check the console for request details."
  }

  if (error instanceof Error && error.message)
  {
    return error.message
  }

  return "Unable to complete the auth request. Check the console for request details."
}

export function logAuthRequestError({
  action,
  error,
  path,
}: {
  action: string
  error: unknown
  path: string
})
{
  const payload = {
    action,
    endpoint: getFlowAuthEndpointUrl(path),
    error:
      error instanceof Error
        ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
        : error,
  }

  console.error("[Flow Auth] Request failed", payload)
  window.flowDiagnostics?.authRequestFailed(payload)
}
