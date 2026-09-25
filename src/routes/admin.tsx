import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [email, setEmail] = useState("");\n  const [password, setPassword] = useState("");
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

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Signing in…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "");
  }
