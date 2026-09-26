import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Safe first-run bootstrap. The database function checks the configured contact email. */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw error;
    return {
      granted: data,
      reason: data ? "" : "Only the portfolio contact email can claim admin access.",
    };
  });
