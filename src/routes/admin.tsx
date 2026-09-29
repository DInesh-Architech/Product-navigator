import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { DEFAULT_PORTRAIT_PATH, getMediaUrl } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type AdminTab = "settings" | "about" | "work" | "building" | "visuals" | "healthcare" | "resume";
type Row = Record<string, unknown> & { id: string };
type Rows = Record<AdminTab, Row[]>;
type PortfolioTable = keyof Database["public"]["Tables"];

const TABLES: Record<AdminTab, PortfolioTable> = {
  settings: "site_settings",
  about: "about",
  work: "selected_work",
  building: "independent_work",
  visuals: "visual_work",
  healthcare: "healthcare_study",
  resume: "resume",
};

const TAB_LABELS: Array<{ key: AdminTab; label: string }> = [
  { key: "settings", label: "Site & contact" },
  { key: "about", label: "About & journey" },
  { key: "work", label: "Selected work" },
  { key: "building", label: "Things I’m building" },
  { key: "visuals", label: "Visual work" },
  { key: "healthcare", label: "Healthcare study" },
  { key: "resume", label: "Résumé" },
];

const FIELD_SPECS: Record<
  AdminTab,
  Array<{ key: string; label: string; kind?: "area" | "lines"; wide?: boolean; help?: string }>
> = {
  settings: [
    {
      key: "hero_headline",
      label: "Hero headline",
      wide: true,
      help: "Use a short editorial headline. The original starter headline is presented as ‘Complexity, made buildable.’; any custom wording overrides it.",
    },
    {
      key: "hero_supporting",
      label: "Hero proof line",
      kind: "area",
      wide: true,
      help: "A short, concrete line about your product work. The original starter copy is displayed as ‘Contract defaults. Cross-module approvals. Clinical handoffs.’ Custom wording overrides it.",
    },
    { key: "contact_email", label: "Contact email" },
    { key: "location", label: "Location" },
    { key: "linkedin_url", label: "LinkedIn URL" },
    { key: "github_url", label: "GitHub URL" },
    { key: "capability_tags", label: "Capabilities (one per line)", kind: "lines", wide: true },
    { key: "seo_title", label: "SEO title", wide: true },
    { key: "seo_description", label: "SEO description", kind: "area", wide: true },
  ],
  about: [
    { key: "intro", label: "About introduction", kind: "area", wide: true },
    { key: "transition_copy", label: "Journey / transition", kind: "area", wide: true },
    {
      key: "portrait_path",
      label: "Portrait image path",
      help: "Shown beside your introduction in About & Journey. Upload a replacement below or paste an image URL. A square image works best. Clear this field and save to hide the photo.",
    },
  ],
  work: [
    { key: "title", label: "Project title" },
    { key: "slug", label: "URL slug" },
    { key: "category", label: "Category" },
    { key: "display_order", label: "Display order" },
    { key: "short_description", label: "Short description", kind: "area", wide: true },
    { key: "challenge", label: "Problem", kind: "area", wide: true },
    { key: "contribution", label: "What I owned", kind: "area", wide: true },
    { key: "workflow", label: "Workflow steps (one per line)", kind: "lines", wide: true },
    { key: "outcome", label: "Outcome", kind: "area", wide: true },
    { key: "tags", label: "Tags (one per line)", kind: "lines", wide: true },
    { key: "evidence_type", label: "Evidence type" },
    { key: "image_path", label: "Evidence image path" },
  ],
  building: [
    { key: "title", label: "Project title" },
    {
      key: "status",
      label: "Stage / status",
      help: "Use Concept until there is a working prototype. A concept description with no image, live URL or repository is presented as Concept.",
    },
    { key: "display_order", label: "Display order" },
    { key: "size_variant", label: "Size variant" },
    { key: "description", label: "Description", kind: "area", wide: true },
    { key: "capabilities", label: "Capabilities (one per line)", kind: "lines", wide: true },
    { key: "live_url", label: "Live URL" },
    { key: "repo_url", label: "Repository URL" },
    { key: "image_path", label: "Image path" },
  ],
  visuals: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "display_order", label: "Display order" },
    { key: "url", label: "Project URL" },
    { key: "short_description", label: "Description", kind: "area", wide: true },
    { key: "image_path", label: "Image path" },
  ],
  healthcare: [
    { key: "title", label: "Title" },
    { key: "summary", label: "Summary", kind: "area", wide: true },
    { key: "bullets", label: "Study details (one per line)", kind: "lines", wide: true },
    { key: "image_path", label: "Image path" },
  ],
  resume: [
    { key: "file_name", label: "File name" },
    {
      key: "file_path",
      label: "Stored file path",
      wide: true,
      help: "PDFs are stored in the private portfolio media bucket and served with a temporary link.",
    },
  ],
};

const ARRAY_KEYS: Partial<Record<AdminTab, string[]>> = {
  settings: ["capability_tags"],
  work: ["workflow", "tags"],
  building: ["capabilities"],
  healthcare: ["bullets"],
};

function emptyRows(): Rows {
  return {
    settings: [],
    about: [],
    work: [],
    building: [],
    visuals: [],
    healthcare: [],
    resume: [],
  };
}

function AdminPage() {
  const [email, setEmail] = useState("odkspav@gmail.com");
  const [signInLinkSent, setSignInLinkSent] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [mfaStage, setMfaStage] = useState<"none" | "setup" | "challenge">("none");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("settings");
  const [rows, setRows] = useState<Rows>(emptyRows);
  const [hasCaseStudyColumn, setHasCaseStudyColumn] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<Row | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const authCheckId = useRef(0);

  const selectedRows = rows[activeTab];
  const checkAdmin = useCallback(async (nextSession: Session) => {
    const checkId = ++authCheckId.current;
    const isCurrent = () => checkId === authCheckId.current;
    setSession(nextSession);
    setCheckingRole(true);
    try {
      const { data: aal, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;
      if (!isCurrent()) return;

      if (aal.currentLevel !== "aal2") {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;
        if (!isCurrent()) return;
        const verifiedTotp = factors.totp.find((factor) => factor.status === "verified");
        setIsAdmin(false);
        setFactorId(verifiedTotp?.id ?? "");
        setQrCode("");
        setTotpSecret("");
        setTotpCode("");
        setMfaStage(verifiedTotp ? "challenge" : "setup");
        setMessage("");
        setError(false);
        return;
      }

      setMfaStage("none");
      setFactorId("");
      setQrCode("");
      setTotpSecret("");
      setTotpCode("");

      const { data, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", nextSession.user.id);
      if (!isCurrent()) return;

      if (roleError) {
        throw roleError;
      }
      if (data?.some((role) => role.role === "admin")) {
        setIsAdmin(true);
        setMessage("");
        setError(false);
        return;
      }

      const bootstrap = await claimAdmin();
      if (!isCurrent()) return;
      if (!bootstrap.granted) {
        setIsAdmin(false);
        setMessage(bootstrap.reason || "First-time admin setup could not be completed.");
        setError(true);
        return;
      }

      const { data: refreshedRoles, error: refreshedRoleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", nextSession.user.id);
      if (!isCurrent()) return;
      if (refreshedRoleError) throw refreshedRoleError;
      const allowed = Boolean(refreshedRoles?.some((role) => role.role === "admin"));
      setIsAdmin(allowed);
      setMessage(
        allowed ? "" : "Admin access was not confirmed after setup. Sign out and try again.",
      );
      setError(!allowed);
    } catch (cause) {
      if (!isCurrent()) return;
      setIsAdmin(false);
      setMessage(cause instanceof Error ? cause.message : "Could not verify admin access.");
      setError(true);
    } finally {
      if (isCurrent()) setCheckingRole(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) await checkAdmin(data.session);
    else {
      authCheckId.current += 1;
      setSession(null);
      setIsAdmin(false);
      setMfaStage("none");
      setCheckingRole(false);
    }
  }, [checkAdmin]);

  useEffect(() => {
    void refreshSession();
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession) {
        setSession(nextSession);
        if (["INITIAL_SESSION", "SIGNED_IN", "MFA_CHALLENGE_VERIFIED"].includes(event))
          window.setTimeout(() => void checkAdmin(nextSession), 0);
      } else {
        authCheckId.current += 1;
        setSession(null);
        setIsAdmin(false);
        setMfaStage("none");
        setCheckingRole(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [checkAdmin, refreshSession]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    async function loadContent() {
      setBusy(true);
      try {
        const entries = await Promise.all(
          TAB_LABELS.map(async ({ key }) => {
            const { data, error: queryError } = await supabase.from(TABLES[key]).select("*");
            if (queryError) throw queryError;
            const values = ((data ?? []) as unknown as Row[]).sort(
              (a, b) => Number(a["display_order"] ?? 0) - Number(b["display_order"] ?? 0),
            );
            return [key, values] as const;
          }),
        );
        const { error: caseStudySchemaError } = await supabase
          .from("selected_work")
          .select("case_study")
          .limit(1);
        if (active) {
          setRows(Object.fromEntries(entries) as Rows);
          setHasCaseStudyColumn(!caseStudySchemaError);
          setMessage("");
          setError(false);
        }
      } catch (cause) {
        if (active) {
          setMessage(cause instanceof Error ? cause.message : "Could not load portfolio content.");
          setError(true);
        }
      } finally {
        if (active) setBusy(false);
      }
    }
    void loadContent();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    const next = rows[activeTab].find((row) => row.id === selectedId) ?? rows[activeTab][0] ?? null;
    if ((next?.id ?? "") !== selectedId) setSelectedId(next?.id ?? "");
    setForm(
      next
        ? {
            ...next,
            ...(activeTab === "about"
              ? { portrait_path: next["portrait_path"] ?? DEFAULT_PORTRAIT_PATH }
              : {}),
          }
        : null,
    );
  }, [activeTab, rows, selectedId]);

  async function requestSignInLink(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Enter the portfolio contact email.");
      setError(true);
      return;
    }
    setBusy(true);
    setMessage("Sending a secure sign-in link…");
    setError(false);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    if (authError) {
      setMessage(authError.message);
      setError(true);
    } else {
      setEmail(normalizedEmail);
      setSignInLinkSent(true);
      setMessage("Open the sign-in link in your inbox. You’ll enter your authenticator code next.");
    }
    setBusy(false);
  }

  async function beginTotpEnrollment() {
    setBusy(true);
    setMessage("Preparing your authenticator setup…");
    setError(false);
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const unfinished = factors.all.filter(
        (factor) =>
          factor.status === "unverified" && factor.friendly_name === "Product Navigator Admin",
      );
      for (const factor of unfinished) {
        const { error: removeError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (removeError) throw removeError;
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Product Navigator Admin",
      });
      if (enrollError) throw enrollError;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
      setTotpCode("");
      setMessage(
        "Scan the QR code in your authenticator app, then enter the 6-digit code it shows.",
      );
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not start authenticator setup.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function verifyTotp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = totpCode.replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) {
      setMessage("Enter the 6-digit code currently shown in your authenticator app.");
      setError(true);
      return;
    }
    if (!factorId) {
      setMessage("Your authenticator setup needs to be restarted. Start setup again below.");
      setError(true);
      return;
    }
    setBusy(true);
    setMessage(
      mfaStage === "setup" && qrCode
        ? "Verifying and enabling your authenticator…"
        : "Verifying authenticator code…",
    );
    setError(false);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (verifyError) {
      setMessage(verifyError.message);
      setError(true);
    } else {
      setTotpCode("");
      setQrCode("");
      setTotpSecret("");
      setMessage("Authenticator verified. Checking admin access…");
      const { data } = await supabase.auth.getSession();
      if (data.session) await checkAdmin(data.session);
    }
    setBusy(false);
  }

  function changeEmail() {
    setSignInLinkSent(false);
    setMessage("");
    setError(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    authCheckId.current += 1;
    setSession(null);
    setIsAdmin(false);
    setMfaStage("none");
    setSignInLinkSent(false);
  }

  function chooseTab(tab: AdminTab) {
    setActiveTab(tab);
    setSelectedId(rows[tab][0]?.id ?? "");
    setMessage("");
  }

  function addRecord() {
    const id = crypto.randomUUID();
    let draft: Row;
    if (activeTab === "settings")
      draft = {
        id,
        hero_headline: "",
        hero_supporting: "",
        capability_tags: [],
        contact_email: "",
        location: "",
        linkedin_url: "",
        github_url: "",
        seo_title: "",
        seo_description: "",
      };
    else if (activeTab === "about")
      draft = { id, intro: "", transition_copy: "", portrait_path: DEFAULT_PORTRAIT_PATH };
    else if (activeTab === "work")
      draft = {
        id,
        title: "New project",
        slug: "new-project",
        category: "Product",
        short_description: "",
        challenge: "",
        contribution: "",
        workflow: [],
        outcome: "",
        tags: [],
        featured: false,
        display_order: rows.work.length + 1,
        image_path: null,
        evidence_type: "Project evidence",
        case_study: {},
        visible: true,
      };
    else if (activeTab === "building")
      draft = {
        id,
        title: "New build",
        status: "Exploration",
        description: "",
        capabilities: [],
        image_path: null,
        live_url: null,
        repo_url: null,
        size_variant: "standard",
        visible: true,
        featured: false,
        display_order: rows.building.length + 1,
      };
    else if (activeTab === "visuals")
      draft = {
        id,
        title: "New visual work",
        category: "Product work",
        short_description: "",
        image_path: null,
        url: null,
        display_order: rows.visuals.length + 1,
        visible: true,
      };
    else if (activeTab === "healthcare")
      draft = {
        id,
        title: "Healthcare workflow study",
        summary: "",
        bullets: [],
        image_path: null,
        visible: true,
      };
    else draft = { id, file_name: null, file_path: null, uploaded_at: null };
    setRows((current) => ({ ...current, [activeTab]: [draft, ...current[activeTab]] }));
    setSelectedId(id);
    setForm(draft);
    setMessage("New draft ready. Save it when the details are complete.");
    setError(false);
  }

  function updateField(key: string, value: unknown) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateCaseField(key: string, value: unknown) {
    setForm((current) => {
      if (!current) return current;
      const details = (
        current["case_study"] && typeof current["case_study"] === "object"
          ? current["case_study"]
          : {}
      ) as Record<string, unknown>;
      return { ...current, case_study: { ...details, [key]: value } };
    });
  }

  function serializeForm(draft: Row): Row {
    const saved = { ...draft };
    for (const key of ARRAY_KEYS[activeTab] ?? []) {
      const value = saved[key];
      saved[key] = Array.isArray(value)
        ? value
        : String(value ?? "")
            .split("\n")
            .map((part) => part.trim())
            .filter(Boolean);
    }
    if (activeTab === "work") {
      if (!hasCaseStudyColumn) {
        delete saved["case_study"];
      } else {
        const details = (
          saved["case_study"] && typeof saved["case_study"] === "object" ? saved["case_study"] : {}
        ) as Record<string, unknown>;
        const nextDetails = { ...details };
        for (const key of ["decisions", "product_workflow", "evidence_items", "shipped"]) {
          const value = nextDetails[key];
          if (value !== undefined)
            nextDetails[key] = Array.isArray(value)
              ? value
              : String(value ?? "")
                  .split("\n")
                  .map((part) => part.trim())
                  .filter(Boolean);
        }
        saved["case_study"] = nextDetails;
      }
    }
    if ("display_order" in saved) saved["display_order"] = Number(saved["display_order"] ?? 0);
    if (
      activeTab === "resume" &&
      "file_name" in saved &&
      !saved["file_name"] &&
      saved["file_path"]
    ) {
      saved["file_name"] = "Résumé.pdf";
    }
    return saved;
  }

  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    setMessage("Saving changes…");
    setError(false);
    try {
      const payload = serializeForm(form);
      const { data, error: saveError } = await supabase
        .from(TABLES[activeTab])
        .upsert(payload as never)
        .select("*")
        .single();
      if (saveError) throw saveError;
      const saved = data as Row;
      setRows((current) => ({
        ...current,
        [activeTab]: current[activeTab].map((row) => (row.id === saved.id ? saved : row)),
      }));
      setForm({ ...saved });
      setMessage("Saved. The public portfolio now reflects this content.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save this content.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file: File, field: "image_path" | "portrait_path" | "file_path") {
    if (!form) return;
    if (file.size > 20 * 1024 * 1024) {
      setMessage("Files must be smaller than 20 MB.");
      setError(true);
      return;
    }
    setBusy(true);
    setMessage("Uploading file…");
    setError(false);
    const filename = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `portfolio/${TABLES[activeTab]}/${form.id}/${Date.now()}-${filename}`;
    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      ...(file.type ? { contentType: file.type } : {}),
    });
    if (uploadError) {
      setMessage(uploadError.message);
      setError(true);
    } else {
      updateField(field, path);
      if (activeTab === "resume") updateField("file_name", file.name);
      setMessage("Uploaded. Save the record to publish this file path.");
    }
    setBusy(false);
  }

  if (!session) {
    return (
      <main className="admin-shell">
        <div className="admin-login-wrap">
          <Link className="case-back" to="/">
            ← Portfolio
          </Link>
          <section className="admin-login">
            <p className="section-kicker">Product Navigator / Private</p>
            <h1>{signInLinkSent ? "Check your email" : "Admin sign in"}</h1>
            <p>
              {signInLinkSent
                ? "Open the sign-in link in this browser. After that, enter the code from your authenticator app."
                : "Enter the portfolio contact email. We’ll send a secure sign-in link, then ask for your authenticator code."}
            </p>
            {signInLinkSent ? (
              <div className="admin-login-form">
                <button
                  className="admin-button"
                  type="button"
                  disabled={busy}
                  onClick={() => void requestSignInLink()}
                >
                  {busy ? "Sending link…" : "Resend sign-in link"}
                </button>
                <button className="admin-button-secondary" type="button" onClick={changeEmail}>
                  Use a different email
                </button>
              </div>
            ) : (
              <form className="admin-login-form" onSubmit={requestSignInLink}>
                <>
                  <Field
                    label="Email address"
                    value={email}
                    type="email"
                    onChange={setEmail}
                    autoComplete="email"
                    required
                  />
                  <button className="admin-button" type="submit" disabled={busy}>
                    {busy ? "Sending link…" : "Send sign-in link"}
                  </button>
                </>
              </form>
            )}
            <div className="admin-login-foot">
              <span>Only the portfolio contact email can claim admin access.</span>
              <Link to="/">Return to portfolio</Link>
            </div>
            <Notice message={message} isError={error} />
          </section>
        </div>
      </main>
    );
  }

  if (mfaStage !== "none") {
    const isEnrollment = mfaStage === "setup";
    return (
      <main className="admin-shell">
        <div className="admin-login-wrap">
          <Link className="case-back" to="/">
            ← Portfolio
          </Link>
          <section className="admin-login">
            <p className="section-kicker">Product Navigator / Authenticator</p>
            <h1>{isEnrollment ? "Set up your authenticator" : "Enter your authenticator code"}</h1>
            {isEnrollment ? (
              qrCode ? (
                <>
                  <p>
                    Scan this QR code with Google Authenticator, Microsoft Authenticator, 1Password,
                    or another TOTP app. Then enter its current 6-digit code to finish setup.
                  </p>
                  <div className="admin-totp-qr-wrap">
                    <img className="admin-totp-qr" src={qrCode} alt="Authenticator setup QR code" />
                  </div>
                  <details className="admin-totp-manual">
                    <summary>Can’t scan? Enter setup key manually</summary>
                    <code>{totpSecret}</code>
                  </details>
                  <form className="admin-login-form" onSubmit={verifyTotp}>
                    <Field
                      label="6-digit authenticator code"
                      value={totpCode}
                      type="text"
                      onChange={setTotpCode}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      required
                    />
                    <button className="admin-button" type="submit" disabled={busy}>
                      {busy ? "Verifying…" : "Verify and enable authenticator"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p>
                    Add an authenticator app once. You’ll use its rotating 6-digit code each time
                    you sign in to the admin panel.
                  </p>
                  <div className="admin-login-form">
                    <button
                      className="admin-button"
                      type="button"
                      disabled={busy}
                      onClick={() => void beginTotpEnrollment()}
                    >
                      {busy ? "Preparing setup…" : "Set up authenticator"}
                    </button>
                  </div>
                </>
              )
            ) : (
              <>
                <p>Open your authenticator app and enter the current code for Product Navigator.</p>
                <form className="admin-login-form" onSubmit={verifyTotp}>
                  <Field
                    label="6-digit authenticator code"
                    value={totpCode}
                    type="text"
                    onChange={setTotpCode}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    required
                  />
                  <button className="admin-button" type="submit" disabled={busy}>
                    {busy ? "Verifying…" : "Verify and continue"}
                  </button>
                </form>
              </>
            )}
            <div className="admin-login-foot">
              <span>Email link verified for {session.user.email ?? "your account"}.</span>
              <button className="admin-text-button" type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            </div>
            <Notice message={message} isError={error} />
          </section>
        </div>
      </main>
    );
  }

  if (checkingRole)
    return (
      <main className="admin-shell">
        <div className="admin-login-wrap">Checking account access…</div>
      </main>
    );

  if (!isAdmin) {
    return (
      <main className="admin-shell">
        <div className="admin-login-wrap">
          <Link className="case-back" to="/">
            ← Portfolio
          </Link>
          <div className="locked-panel">
            <strong>Admin role required</strong>
            <p>
              Signed in as {session?.user.email ?? "an unknown account"}. The admin check did not
              complete successfully.
            </p>
            <Notice message={message || "No admin role was returned for this account."} isError />
            <button
              className="admin-button-secondary"
              onClick={() => session && void checkAdmin(session)}
              disabled={checkingRole}
            >
              {checkingRole ? "Checking…" : "Check access again"}
            </button>
            <button className="admin-button-secondary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-header">
          <div>
            <p className="section-kicker">Product Navigator / Content studio</p>
            <h1>Admin</h1>
          </div>
          <div className="admin-actions">
            <Link className="admin-button-secondary" to="/">
              View portfolio ↗
            </Link>
            <button className="admin-button-secondary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>
        <div className="admin-layout">
          <aside className="admin-side" aria-label="Content sections">
            <p>Portfolio content</p>
            {TAB_LABELS.map(({ key, label }) => (
              <button
                key={key}
                className="admin-tab"
                aria-current={activeTab === key ? "page" : undefined}
                onClick={() => chooseTab(key)}
              >
                <span>{label}</span>
                <small>{rows[key].length}</small>
              </button>
            ))}
          </aside>
          <section className="admin-main">
            <Notice message={message} isError={error} />
            <div className="admin-editor-head">
              <div>
                <h2>{TAB_LABELS.find(({ key }) => key === activeTab)?.label}</h2>
                <p>Changes save to the live portfolio content source.</p>
              </div>
              {activeTab !== "settings" && activeTab !== "about" && activeTab !== "resume" && (
                <button className="admin-button-secondary" onClick={addRecord}>
                  + Add item
                </button>
              )}
            </div>
            <div className="admin-form-layout">
              <div className="admin-records" aria-label="Records">
                {selectedRows.map((row) => (
                  <button
                    key={row.id}
                    className="admin-record"
                    aria-current={row.id === selectedId}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <strong>{recordTitle(activeTab, row)}</strong>
                    <small>{recordStatus(activeTab, row)}</small>
                  </button>
                ))}
                {!selectedRows.length ? <div className="admin-empty">No records yet.</div> : null}
              </div>
              {form ? (
                <form className="admin-editor" onSubmit={saveRecord}>
                  <div className="admin-fields">
                    {FIELD_SPECS[activeTab].map((field) => (
                      <Field
                        key={field.key}
                        label={field.label}
                        value={fieldValue(form[field.key])}
                        {...(field.kind ? { kind: field.kind } : {})}
                        {...(field.wide ? { wide: true } : {})}
                        {...(field.help ? { help: field.help } : {})}
                        onChange={(value) => updateField(field.key, value)}
                      />
                    ))}
                    {activeTab === "work" && hasCaseStudyColumn ? (
                      <CaseStudyFields form={form} update={updateCaseField} />
                    ) : null}
                    {activeTab === "work" && !hasCaseStudyColumn ? (
                      <div className="admin-notice admin-field--wide">
                        Detailed case fields need the included Supabase migration before they can be
                        edited. Other project fields remain editable.
                      </div>
                    ) : null}
                    {supportsImageUpload(activeTab) ? (
                      <UploadField
                        activeTab={activeTab}
                        form={form}
                        field={
                          activeTab === "about"
                            ? "portrait_path"
                            : activeTab === "resume"
                              ? "file_path"
                              : "image_path"
                        }
                        busy={busy}
                        onUpload={uploadFile}
                      />
                    ) : null}
                    {hasVisibility(activeTab) ? (
                      <div className="admin-toggle-row admin-field--wide">
                        <Toggle
                          label="Visible on the portfolio"
                          checked={Boolean(form["visible"])}
                          onChange={(value) => updateField("visible", value)}
                        />
                        {activeTab === "work" || activeTab === "building" ? (
                          <Toggle
                            label="Feature on homepage"
                            checked={Boolean(form["featured"])}
                            onChange={(value) => updateField("featured", value)}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="admin-form-footer">
                    <span className="admin-field-help">
                      Content is saved to Supabase. Hiding a record keeps it in the archive.
                    </span>
                    <button className="admin-button" type="submit" disabled={busy}>
                      {busy ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-empty">Choose a record to edit.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  kind,
  wide,
  help,
  type = "text",
  autoComplete,
  inputMode,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind?: "area" | "lines";
  wide?: boolean;
  help?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const placeholder = kind === "lines" ? "One item per line" : undefined;
  return (
    <div className={"admin-field" + (wide ? " admin-field--wide" : "")}>
      <label htmlFor={id}>{label}</label>
      {kind ? (
        <textarea
          id={id}
          className="admin-textarea"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          className="admin-input"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
        />
      )}
      {help ? <span className="admin-field-help">{help}</span> : null}
    </div>
  );
}

function CaseStudyFields({
  form,
  update,
}: {
  form: Row;
  update: (key: string, value: unknown) => void;
}) {
  const details = (
    form["case_study"] && typeof form["case_study"] === "object" ? form["case_study"] : {}
  ) as Record<string, unknown>;
  const fields = [
    { key: "cover_title", label: "Exhibition title (optional, short title for homepage)" },
    { key: "cover_summary", label: "Exhibition summary (optional)", kind: "area" as const },
    {
      key: "cover_owned",
      label: "Homepage: owned (optional, otherwise uses What I owned)",
      kind: "area" as const,
    },
    {
      key: "cover_decision",
      label: "Homepage: key decision (optional, otherwise uses the first decision)",
      kind: "area" as const,
    },
    { key: "hero_image_path", label: "Hero image path (optional, defaults to the evidence image)" },
    { key: "role_label", label: "Short role label (optional)" },
    { key: "timeline", label: "Timeline (optional, only add confirmed dates)" },
    { key: "live_url", label: "Live product URL (optional)" },
    { key: "stage", label: "Stage" },
    { key: "context", label: "Context" },
    { key: "decisions", label: "Important decisions (one per line)", kind: "lines" as const },
    {
      key: "product_workflow",
      label: "Product/workflow steps (one per line)",
      kind: "lines" as const,
    },
    { key: "evidence_caption", label: "Evidence caption" },
    { key: "evidence_items", label: "Evidence artifacts (one per line)", kind: "lines" as const },
    { key: "shipped", label: "What shipped / advanced (one per line)", kind: "lines" as const },
    { key: "learning", label: "Learning", kind: "area" as const },
  ];
  const gallery = (Array.isArray(details["gallery"]) ? details["gallery"] : []) as Array<{
    image_path: string;
    caption: string;
  }>;
  function changeGallery(index: number, key: "image_path" | "caption", value: string) {
    update(
      "gallery",
      gallery.map((asset, i) => (i === index ? { ...asset, [key]: value } : asset)),
    );
  }
  function moveGallery(index: number, direction: number) {
    const reordered = [...gallery];
    const other = index + direction;
    if (other < 0 || other >= reordered.length) return;
    [reordered[index], reordered[other]] = [reordered[other]!, reordered[index]!];
    update("gallery", reordered);
  }
  return (
    <div className="admin-case-fields">
      <h3>Case study details</h3>
      <p className="admin-field-help">
        Presentation, captions and gallery order use the existing case-study record. No database
        migration is needed.
      </p>
      <div className="admin-field admin-field--wide">
        <label htmlFor="project-presentation">Project presentation</label>
        <select
          id="project-presentation"
          className="admin-select"
          value={String(details["presentation"] || "")}
          onChange={(event) => update("presentation", event.target.value)}
        >
          <option value="">Automatic, based on the project</option>
          <option value="workspace">Workspace / interface fragments</option>
          <option value="flow">Construction / workflow</option>
          <option value="map">Healthcare / system map</option>
          <option value="image">Full image</option>
        </select>
      </div>
      <div className="admin-case-grid">
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            value={fieldValue(details[field.key])}
            {...(field.kind ? { kind: field.kind } : {})}
            wide
            onChange={(value) => update(field.key, value)}
          />
        ))}
      </div>
      <div className="admin-gallery-editor">
        <h3>Additional evidence gallery</h3>
        <p className="admin-field-help">
          The main evidence image appears first. Add public URLs or uploaded media paths below;
          captions should explain what each artifact proves and whether it is reconstructed.
        </p>
        {gallery.map((asset, index) => (
          <div className="admin-gallery-item" key={index}>
            <div className="admin-gallery-toolbar">
              <strong>Artifact {index + 1}</strong>
              <div>
                <button
                  type="button"
                  className="admin-text-button"
                  disabled={index === 0}
                  aria-label={`Move artifact ${index + 1} up`}
                  onClick={() => moveGallery(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-text-button"
                  disabled={index === gallery.length - 1}
                  aria-label={`Move artifact ${index + 1} down`}
                  onClick={() => moveGallery(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-text-button"
                  onClick={() =>
                    update(
                      "gallery",
                      gallery.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
            <Field
              label={`Artifact ${index + 1} image path or URL`}
              value={asset.image_path}
              wide
              onChange={(value) => changeGallery(index, "image_path", value)}
            />
            <Field
              label={`Artifact ${index + 1} caption`}
              value={asset.caption}
              kind="area"
              wide
              onChange={(value) => changeGallery(index, "caption", value)}
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-button-secondary"
          onClick={() => update("gallery", [...gallery, { image_path: "", caption: "" }])}
        >
          Add evidence image
        </button>
      </div>
    </div>
  );
}

function UploadField({
  activeTab,
  form,
  field,
  busy,
  onUpload,
}: {
  activeTab: AdminTab;
  form: Row;
  field: "image_path" | "portrait_path" | "file_path";
  busy: boolean;
  onUpload: (file: File, field: "image_path" | "portrait_path" | "file_path") => Promise<void>;
}) {
  const value = fieldValue(form[field]);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (value && activeTab !== "resume")
      getMediaUrl(value).then((url) => {
        if (active) setPreview(url);
      });
    else setPreview(null);
    return () => {
      active = false;
    };
  }, [value, activeTab]);
  const isPdf = activeTab === "resume";
  return (
    <div className="admin-upload-block admin-field--wide">
      <label className="admin-label" htmlFor="admin-upload">
        {isPdf ? "Résumé PDF" : "Image asset"}
      </label>
      <div className="admin-upload">
        <input
          id="admin-upload"
          type="file"
          accept={isPdf ? "application/pdf,.pdf" : "image/*"}
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void onUpload(file, field);
            event.currentTarget.value = "";
          }}
        />
        <span className="admin-field-help">
          Maximum 20 MB. Uploads are stored in Supabase media.
        </span>
      </div>
      {preview ? (
        <img className="admin-preview" src={preview} alt="Current uploaded asset preview" />
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="admin-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function Notice({ message, isError }: { message: string; isError: boolean }) {
  return message ? (
    <p className={"admin-notice" + (isError ? " admin-error" : "")} role="status">
      {message}
    </p>
  ) : null;
}

function fieldValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).join("\n");
  return value == null ? "" : String(value);
}

function recordTitle(tab: AdminTab, row: Row): string {
  if (tab === "settings") return "Homepage & contact";
  if (tab === "about") return "About & journey";
  if (tab === "resume") return fieldValue(row["file_name"]) || "Résumé file";
  return fieldValue(row["title"]) || "Untitled record";
}

function recordStatus(tab: AdminTab, row: Row): string {
  const words = [fieldValue(row["category"]), fieldValue(row["status"])];
  if ("featured" in row) words.push(row["featured"] ? "Featured" : "Archive");
  if ("visible" in row) words.push(row["visible"] ? "Visible" : "Hidden / preserved");
  if (tab === "resume" && row["file_path"]) words.push("Uploaded");
  return words.filter(Boolean).join(" · ") || "Content record";
}

function hasVisibility(tab: AdminTab) {
  return ["work", "building", "visuals", "healthcare"].includes(tab);
}

function supportsImageUpload(tab: AdminTab) {
  return ["about", "work", "building", "visuals", "healthcare", "resume"].includes(tab);
}
