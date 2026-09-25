import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (!data.session) {
      setIsAdmin(false);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id);
    setIsAdmin(Boolean(roles?.some((r: any) => r.role === "admin")));
  }

  useEffect(() => {
    refresh();
    const { data } = supabase.auth.onAuthStateChange(() => refresh());
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "");
  }

  async function signOut() {
    await supabase.auth.signOut();
    await refresh();
  }

  if (!session) {
    return (
      <main className="min-h-screen px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-lg">
          <Link to="/" className="text-sm text-muted-foreground">← Portfolio</Link>
          <div className="panel mt-8 p-7">
            <p className="eyebrow">Product Navigator</p>
            <h1 className="mt-3 text-3xl font-semibold">Admin sign in</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sign in with your private portfolio admin account.
            </p>
            <form onSubmit={signIn} className="mt-6 space-y-3">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="username" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-border-strong" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-border-strong" />
              <button className="btn-base btn-primary w-full" type="submit">Sign in</button>
            </form>
            {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Product Navigator</p>
            <h1 className="mt-2 text-3xl font-semibold">Admin</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="btn-base btn-outline">View portfolio</Link>
            <button onClick={signOut} className="btn-base btn-outline">Sign out</button>
          </div>
        </div>
        <div className="panel mt-8 p-6">
          <h2 className="text-lg font-semibold">{isAdmin ? "Admin access active" : "Account signed in"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAdmin
              ? "Authentication and role protection are connected. Content editors can now be added safely."
              : "This account has not been assigned the admin role yet."}
          </p>
        </div>
      </div>
    </main>
  );
}
