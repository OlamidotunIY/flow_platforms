import * as React from "react";
import { Building2, LogOut, Mail, Route, ShieldCheck } from "lucide-react";
import { BrowserRouter, Link, Navigate, Outlet, Route as RouterRoute, Routes } from "react-router-dom";

import { Button } from "@flow/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@flow/ui/components/card";
import { Input } from "@flow/ui/components/input";

import { clearFlowAuthState, getFlowAuthClient } from "./auth";

function useAuthClient() {
  return React.useMemo(() => getFlowAuthClient(), []);
}

function AuthLayout() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-8 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Flow</CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </main>
  );
}

function SignInPage() {
  const authClient = useAuthClient();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to sign in.");
      return;
    }

    window.location.assign("/");
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1 text-xs font-medium">
        Email
        <Input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="grid gap-1 text-xs font-medium">
        Password
        <Input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <Link className="text-xs text-muted-foreground underline-offset-4 hover:underline" to="/sign-up">
        Create an account
      </Link>
    </form>
  );
}

function SignUpPage() {
  const authClient = useAuthClient();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const result = await authClient.signUp.email({
      email,
      name,
      password,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to create account.");
      return;
    }

    window.location.assign("/");
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1 text-xs font-medium">
        Name
        <Input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="grid gap-1 text-xs font-medium">
        Email
        <Input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="grid gap-1 text-xs font-medium">
        Password
        <Input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating..." : "Create account"}
      </Button>
      <Link className="text-xs text-muted-foreground underline-offset-4 hover:underline" to="/sign-in">
        Sign in instead
      </Link>
    </form>
  );
}

function RequireSession() {
  const authClient = useAuthClient();
  const session = authClient.useSession();

  if (session.isPending) {
    return <main className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading...</main>;
  }

  if (!session.data) {
    return <Navigate replace to="/sign-in" />;
  }

  return <Outlet />;
}

function AppLayout() {
  const authClient = useAuthClient();
  const session = authClient.useSession();

  async function signOut() {
    await authClient.signOut();
    await clearFlowAuthState();
    window.location.assign("/sign-in");
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r bg-card/40 p-4 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4" />
          Flow
        </div>
        <nav className="grid gap-1 text-sm">
          <Link className="rounded-md px-2 py-1.5 hover:bg-muted" to="/">
            Overview
          </Link>
          <Link className="rounded-md px-2 py-1.5 hover:bg-muted" to="/organization">
            Organization
          </Link>
        </nav>
        <Button className="mt-auto justify-start" onClick={signOut} variant="ghost">
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </aside>
      <main className="md:pl-56">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="text-sm font-medium">{session.data?.user.email}</div>
          <Button onClick={signOut} size="sm" variant="outline">
            <LogOut className="size-3" />
            Sign out
          </Button>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function OverviewPage() {
  const authClient = useAuthClient();
  const session = authClient.useSession();

  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Authenticated API clients are configured for this session.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-4" />
              User
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{session.data?.user.email}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="size-4" />
              Routing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Shared by web and desktop through @flow/app-shell.</CardContent>
        </Card>
      </div>
    </section>
  );
}

function OrganizationPage() {
  const authClient = useAuthClient();
  const organizations = authClient.useListOrganizations();

  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-lg font-semibold">Organization</h1>
        <p className="text-sm text-muted-foreground">Better Auth organization client is configured here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4" />
            Organizations
          </CardTitle>
          <CardDescription>Current user organizations from Better Auth.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(organizations.data ?? [], null, 2)}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

export function FlowApp() {
  return (
    <BrowserRouter>
      <Routes>
        <RouterRoute element={<AuthLayout />}>
          <RouterRoute element={<SignInPage />} path="/sign-in" />
          <RouterRoute element={<SignUpPage />} path="/sign-up" />
        </RouterRoute>
        <RouterRoute element={<RequireSession />}>
          <RouterRoute element={<AppLayout />}>
            <RouterRoute element={<OverviewPage />} index />
            <RouterRoute element={<OrganizationPage />} path="/organization" />
          </RouterRoute>
        </RouterRoute>
      </Routes>
    </BrowserRouter>
  );
}
