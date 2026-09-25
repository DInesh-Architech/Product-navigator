import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState(false);
  const [message, setMessage] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (!data.session) { setRole(false); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
    setRole(Boolean(roles?.some((r:any) => r.role === "admin")));
    const tables = ["selected_work","independent_work","healthcare_study","visual_work"];
    const next: Record<string,number> = {};
    for (const table of tables) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      next[table] = count ?? 0;
    }
    setCounts(next);
  }

  useEffect(() => {
    refresh();
    const { data } = supabase.auth.onAuthStateChange(() => refresh());
    return () => data.subscription.unsubscribe();
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Sending secure sign-in link…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setMessage(error ? error.message : "Check your email for the secure sign-in link.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    await refresh();
  }

  if (!session) return (
    <main className="min-h-screen px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="text-sm text-muted-foreground">← Portfolio</Link>
        <div className="panel mt-8 p-7">
          <p className="eyebrow">Product Navigator</p>
          <h1 className="mt-3 text-3xl font-semibold">Admin sign in</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Use the email address assigned the admin role. A secure sign-in link will be sent to your inbox.</p>
          <form onSubmit={sendLink} className="mt-6 space-y-3">
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-border-strong" />
            <button className="btn-base btn-primary w-full" type="submit">Send sign-in link</button>
          </form>
          {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="eyebrow">Product Navigator</p><h1 className="mt-2 text-3xl font-semibold">Admin</h1></div>
          <div className="flex gap-2"><Link to="/" className="btn-base btn-outline">View portfolio</Link><button onClick={signOut} className="btn-base btn-outline">Sign out</button></div>
        </div>
        {!role ? (
          <div className="panel mt-8 p-6"><h2 className="text-lg font-semibold">Account signed in</h2><p className="mt-2 text-sm text-muted-foreground">This account has not been assigned the admin role yet. Assign it in Supabase before editing portfolio content.</p></div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(counts).map(([k,v])=><div key={k} className="panel p-5"><p className="text-2xl font-semibold">{v}</p><p className="mt-1 text-xs text-muted-foreground">{k.replaceAll("_"," ")}</p></div>)}
            </div>
            <div className="panel mt-6 p-6"><h2 className="text-lg font-semibold">Admin access active</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Authentication and role protection are connected. Next we can add the content editors, image uploads and resume management here without exposing write access publicly.</p></div>
          </>
        )}
      </div>
    </main>
  );
}
